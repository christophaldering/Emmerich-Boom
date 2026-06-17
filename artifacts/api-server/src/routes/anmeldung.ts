import { Router } from "express";
import { z } from "zod";
import { db, anmeldungenTable, wartelisteTable } from "@workspace/db";
import { sql, sum, eq, isNull, and, ne, notInArray } from "drizzle-orm";
import { sendBestaetigung } from "../services/mailer.js";
import { generateKaiComment } from "./stimmung.js";
import { SERVER_CONFIG } from "../config.js";

const router = Router();

const PREIS_PRO_PERSON = 10;
const KAPAZITAET = 275;

// Wenn false: Anmeldungen nur noch mit gültigem Nachrücker-Token erlaubt.
// Muss zusammen mit PHASE2_CONFIG.ANMELDUNG_AKTIV im Frontend konsistent gehalten werden.
const ANMELDUNG_AKTIV = false;

const anmeldungSchema = z
  .object({
    email:           z.string().email().max(300),
    telefon:         z.string().max(50).optional().nullable(),
    personen_anzahl: z.number().int().min(1).max(6),
    personen:        z.array(z.string().min(2).max(200)),
    bezahlweg:       z.enum(["ueberweisung", "paypal"]).optional().default("ueberweisung"),
    song:            z.string().max(300).optional().nullable(),
    statement:       z.string().max(200).optional().nullable(),
    verbindlich:     z.literal(true, {
      errorMap: () => ({ message: "Verbindliche Anmeldung muss bestätigt werden." }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.personen.length !== data.personen_anzahl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["personen"],
        message: `Erwartet ${data.personen_anzahl} Namen, erhalten ${data.personen.length}.`,
      });
    }
  });

router.get("/anmeldung/stats", async (req, res) => {
  try {
    const result = await db
      .select({ total: sum(anmeldungenTable.personen_anzahl) })
      .from(anmeldungenTable)
      .where(and(isNull(anmeldungenTable.storniert_am), ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_DEMO_EMAIL), ne(anmeldungenTable.bezahlweg, "freiticket"), notInArray(anmeldungenTable.email, [...SERVER_CONFIG.THEKE_FREIKARTEN_EMAILS])));
    const angemeldete_personen = Number(result[0]?.total ?? 0);
    const verfuegbar = Math.max(0, KAPAZITAET - angemeldete_personen);
    res.json({ angemeldete_personen, kapazitaet: KAPAZITAET, verfuegbar });
  } catch (err) {
    req.log.error(err, "anmeldung stats failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

router.post("/anmeldung", async (req, res) => {
  const parsed = anmeldungSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe", details: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;
  const betrag_gesamt = d.personen_anzahl * PREIS_PRO_PERSON;

  const nachrueckerToken =
    typeof req.body.nachruecker_token === "string" && req.body.nachruecker_token.trim()
      ? (req.body.nachruecker_token as string).trim()
      : null;

  try {
    // Wenn Anmeldung nur noch über Warteliste läuft: Token ist Pflicht
    if (!ANMELDUNG_AKTIV && !nachrueckerToken) {
      res.status(403).json({
        error: "nur_warteliste",
        message: "Anmeldungen laufen aktuell nur noch über die Warteliste. Bitte wende dich an Christoph.",
      });
      return;
    }

    const capacityResult = await db
      .select({ total: sum(anmeldungenTable.personen_anzahl) })
      .from(anmeldungenTable)
      .where(and(isNull(anmeldungenTable.storniert_am), ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_DEMO_EMAIL), notInArray(anmeldungenTable.email, [...SERVER_CONFIG.THEKE_FREIKARTEN_EMAILS])));
    const currentTotal = Number(capacityResult[0]?.total ?? 0);
    if (currentTotal + d.personen_anzahl > KAPAZITAET) {
      res.status(409).json({
        error: "ausgebucht",
        message: "Es sind leider keine freien Plätze mehr verfügbar.",
      });
      return;
    }

    let wartelisteId: number | null = null;
    if (nachrueckerToken) {
      const tokenRows = await db
        .select({ id: wartelisteTable.id, nachruecker_status: wartelisteTable.nachruecker_status })
        .from(wartelisteTable)
        .where(eq(wartelisteTable.nachruecker_token, nachrueckerToken))
        .limit(1);

      if (tokenRows.length === 0 || tokenRows[0].nachruecker_status !== "angenommen") {
        res.status(403).json({
          error: "ungültiger_token",
          message: "Dein Einladungslink ist ungültig oder bereits verwendet. Bitte melde dich bei Christoph.",
        });
        return;
      }
      wartelisteId = tokenRows[0].id;
    }

    const existingByEmail = await db
      .select({ id: anmeldungenTable.id, personen: anmeldungenTable.personen })
      .from(anmeldungenTable)
      .where(and(
        sql`LOWER(${anmeldungenTable.email}) = LOWER(${d.email})`,
        isNull(anmeldungenTable.storniert_am),
      ));

    if (existingByEmail.length > 0) {
      const submittedNames = d.personen.map(n => n.toLowerCase().trim());
      const hasNameOverlap = existingByEmail.some(row => {
        const existingPersonen = Array.isArray(row.personen) ? (row.personen as string[]) : [];
        return existingPersonen.some(name => submittedNames.includes(name.toLowerCase().trim()));
      });
      if (hasNameOverlap) {
        res.status(409).json({
          error: "duplicate",
          message: "Eine Anmeldung mit diesen Daten liegt bereits vor. Bei Fragen melde dich einfach bei Christoph.",
        });
        return;
      }
    }

    const { id, ticket_nummern } = await db.transaction(async (tx) => {
      const counterResult = await tx.execute(
        sql`SELECT next_nummer FROM ticket_nummer_counter WHERE id = 1 FOR UPDATE`,
      );
      const startNum = Number(
        (counterResult.rows[0] as { next_nummer: number })?.next_nummer ?? 1,
      );

      const nummern: number[] = Array.from(
        { length: d.personen_anzahl },
        (_, i) => startNum + i,
      );

      await tx.execute(
        sql`UPDATE ticket_nummer_counter SET next_nummer = ${startNum + d.personen_anzahl} WHERE id = 1`,
      );

      const inserted = await tx
        .insert(anmeldungenTable)
        .values({
          email:           d.email,
          telefon:         d.telefon ?? null,
          personen_anzahl: d.personen_anzahl,
          personen:        d.personen,
          bezahlweg:       d.bezahlweg,
          song:            d.song ?? null,
          statement:       d.statement ?? null,
          betrag_gesamt,
          ticket_nummern:  nummern,
        })
        .returning({ id: anmeldungenTable.id });

      return { id: inserted[0]?.id ?? null, ticket_nummern: nummern };
    });

    // 201 sofort senden — Mail-Versand blockiert den User nicht
    res.status(201).json({ id, betrag_gesamt, ticket_nummern });

    // Nachrücker-Token invalidieren (token auf null setzen; status bleibt 'angenommen')
    if (wartelisteId !== null) {
      db.update(wartelisteTable)
        .set({ nachruecker_token: null })
        .where(eq(wartelisteTable.id, wartelisteId))
        .catch((err: unknown) => {
          req.log.error({ err, wartelisteId }, "Nachrücker-Token-Invalidierung fehlgeschlagen");
        });
    }

    // Fire-and-forget: KaI-Kommentar mit aktuellen Daten neu generieren
    generateKaiComment().catch(() => {});

    // Fire-and-forget: Bestätigungsmail asynchron versenden
    sendBestaetigung({
      to:             d.email,
      personen:       d.personen,
      personen_anzahl: d.personen_anzahl,
      bezahlweg:      d.bezahlweg,
      betrag_gesamt,
    })
      .then(() => {
        // Bei Erfolg: Timestamp in DB setzen
        return db
          .update(anmeldungenTable)
          .set({ bestaetigungsmail_versendet_am: new Date() })
          .where(eq(anmeldungenTable.id, id!));
      })
      .catch((err: unknown) => {
        req.log.error({ err, anmeldungId: id }, "Bestätigungsmail fehlgeschlagen");
      });

  } catch (err) {
    if (
      typeof err === "object" && err !== null &&
      "code" in err && (err as { code: string }).code === "23505"
    ) {
      res.status(409).json({
        error: "duplicate",
        message: "Diese E-Mail-Adresse ist bereits angemeldet. Falls du etwas ändern möchtest, melde dich einfach bei Christoph.",
      });
      return;
    }
    req.log.error(err, "anmeldung insert failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
