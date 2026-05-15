import { Router } from "express";
import { z } from "zod";
import { db, anmeldungenTable } from "@workspace/db";
import { sql, sum } from "drizzle-orm";

const router = Router();

const PREIS_PRO_PERSON = 10;

const anmeldungSchema = z
  .object({
    email:           z.string().email().max(300),
    telefon:         z.string().max(50).optional().nullable(),
    personen_anzahl: z.number().int().min(1).max(6),
    personen:        z.array(z.string().min(2).max(200)),
    bezahlweg:       z.enum(["ueberweisung", "paypal"]),
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
      .from(anmeldungenTable);
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
    // Ermittle die aktuell höchste vergebene Nummer über alle Anmeldungen
    const maxResult = await db.execute(
      sql`SELECT COALESCE(MAX(val::int), 0) AS max_num
          FROM anmeldungen
          CROSS JOIN LATERAL jsonb_array_elements_text(ticket_nummern) AS t(val)`,
    );
    const maxNum = Number((maxResult.rows[0] as { max_num: string })?.max_num ?? 0);

    // Fortlaufende Nummern ab maxNum+1
    const ticket_nummern: number[] = Array.from(
      { length: d.personen_anzahl },
      (_, i) => maxNum + 1 + i,
    );

    const inserted = await db
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
        ticket_nummern,
      })
      .returning({ id: anmeldungenTable.id });

    res.status(201).json({
      id:             inserted[0]?.id ?? null,
      betrag_gesamt,
      ticket_nummern,
    });
  } catch (err) {
    req.log.error(err, "anmeldung insert failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
