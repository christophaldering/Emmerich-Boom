import { Router } from "express";
import { z } from "zod";
import { db, anmeldungenTable } from "@workspace/db";
import { sql, sum, eq, isNull, and } from "drizzle-orm";
import { sendBestaetigung } from "../services/mailer.js";

const router = Router();

const PREIS_PRO_PERSON = 10;

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
      .where(isNull(anmeldungenTable.storniert_am));
    const angemeldete_personen = Number(result[0]?.total ?? 0);
    res.json({ angemeldete_personen });
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

  try {
    const existing = await db
      .select({ id: anmeldungenTable.id })
      .from(anmeldungenTable)
      .where(and(
        sql`LOWER(${anmeldungenTable.email}) = LOWER(${d.email})`,
        isNull(anmeldungenTable.storniert_am),
      ))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({
        error: "Diese E-Mail-Adresse ist bereits angemeldet. Falls du etwas ändern möchtest, melde dich einfach bei Christoph.",
      });
      return;
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
    req.log.error(err, "anmeldung insert failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
