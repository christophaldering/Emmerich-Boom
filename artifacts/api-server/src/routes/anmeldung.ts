import { Router } from "express";
import { z } from "zod";
import { db, anmeldungenTable } from "@workspace/db";

const router = Router();

const anmeldungSchema = z.object({
  hauptname:       z.string().min(1).max(200),
  email:           z.string().email().max(300),
  telefon:         z.string().max(50).optional().nullable(),
  personen_anzahl: z.number().int().min(1).max(6),
  begleitnamen:    z.array(z.string().max(200)),
  bezahlweg:       z.enum(["ueberweisung", "paypal", "bar"]),
  song:            z.string().max(300).optional().nullable(),
  statement:       z.string().max(200).optional().nullable(),
  betrag_gesamt:   z.number().int().min(1),
});

router.post("/anmeldung", async (req, res) => {
  const parsed = anmeldungSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe", details: parsed.error.flatten() });
    return;
  }

  const d = parsed.data;

  try {
    const inserted = await db
      .insert(anmeldungenTable)
      .values({
        hauptname:       d.hauptname,
        email:           d.email,
        telefon:         d.telefon ?? null,
        personen_anzahl: d.personen_anzahl,
        begleitnamen:    d.begleitnamen,
        bezahlweg:       d.bezahlweg,
        song:            d.song ?? null,
        statement:       d.statement ?? null,
        betrag_gesamt:   d.betrag_gesamt,
      })
      .returning({ id: anmeldungenTable.id });

    res.json({ ok: true, id: inserted[0]?.id ?? null });
  } catch (err) {
    req.log.error(err, "anmeldung insert failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
