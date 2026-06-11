import { Router } from "express";
import { z } from "zod";
import { db, wartelisteTable, anmeldungenTable } from "@workspace/db";
import { sql, sum, isNull, eq } from "drizzle-orm";
import { sendWartelisteBestaetigung } from "../services/mailer.js";

const router = Router();

const KAPAZITAET = 275;

const wartelisteSchema = z.object({
  email: z.string().email().max(300),
});

router.post("/warteliste", async (req, res) => {
  const parsed = wartelisteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige E-Mail-Adresse" });
    return;
  }

  const { email } = parsed.data;

  try {
    const countResult = await db
      .select({ total: sum(anmeldungenTable.personen_anzahl) })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am));
    const angemeldete = Number(countResult[0]?.total ?? 0);

    if (angemeldete < KAPAZITAET) {
      res.status(400).json({ error: "Es sind noch Plätze verfügbar. Bitte direkt anmelden." });
      return;
    }

    await db.insert(wartelisteTable).values({ email });

    res.status(201).json({ ok: true });

    sendWartelisteBestaetigung({ to: email })
      .then(() =>
        db
          .update(wartelisteTable)
          .set({ bestaetigung_versendet_am: new Date() })
          .where(eq(wartelisteTable.email, email)),
      )
      .catch((err: unknown) => {
        req.log.error({ err, email }, "Wartelisten-Bestätigungsmail fehlgeschlagen");
      });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      res.status(409).json({ error: "already_on_list", message: "Diese E-Mail-Adresse steht bereits auf der Warteliste." });
      return;
    }
    req.log.error(err, "warteliste insert failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "emmerich-orga-stats-2026";

router.get("/admin/warteliste", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const rows = await db
      .select({
        id: wartelisteTable.id,
        email: wartelisteTable.email,
        created_at: wartelisteTable.created_at,
        bestaetigung_versendet_am: wartelisteTable.bestaetigung_versendet_am,
      })
      .from(wartelisteTable)
      .orderBy(wartelisteTable.created_at);

    res.json({ count: rows.length, eintraege: rows });
  } catch (err) {
    req.log.error(err, "admin warteliste fetch failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

export default router;
