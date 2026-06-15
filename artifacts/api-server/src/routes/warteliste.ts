import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db, wartelisteTable, anmeldungenTable } from "@workspace/db";
import { sum, isNull, eq } from "drizzle-orm";
import { sendWartelisteBestaetigung, sendNachrueckerEinladung } from "../services/mailer.js";

const router = Router();

const KAPAZITAET = 275;
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "emmerich-orga-stats-2026";

const wartelisteSchema = z.object({
  email: z.string().email().max(300),
});

// ─── POST /warteliste — Eintragen ──────────────────────────────────────────

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

// ─── GET /admin/warteliste — Liste ────────────────────────────────────────

router.get("/admin/warteliste", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const rows = await db
      .select({
        id:                        wartelisteTable.id,
        email:                     wartelisteTable.email,
        created_at:                wartelisteTable.created_at,
        bestaetigung_versendet_am: wartelisteTable.bestaetigung_versendet_am,
        nachruecker_eingeladen_am: wartelisteTable.nachruecker_eingeladen_am,
        nachruecker_status:        wartelisteTable.nachruecker_status,
      })
      .from(wartelisteTable)
      .orderBy(wartelisteTable.created_at);

    res.json({ count: rows.length, eintraege: rows });
  } catch (err) {
    req.log.error(err, "admin warteliste fetch failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ─── DELETE /admin/warteliste/:id — Löschen ───────────────────────────────

router.delete("/admin/warteliste/:id", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  try {
    const deleted = await db
      .delete(wartelisteTable)
      .where(eq(wartelisteTable.id, id))
      .returning({ id: wartelisteTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Eintrag nicht gefunden" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "admin warteliste delete failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ─── POST /admin/warteliste/:id/einladen — Nachrücker einladen ────────────

router.post("/admin/warteliste/:id/einladen", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(wartelisteTable)
      .where(eq(wartelisteTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Eintrag nicht gefunden" });
      return;
    }

    const eintrag = rows[0];

    const token = randomBytes(24).toString("hex");

    const proto  = ((req.headers["x-forwarded-proto"] as string) ?? req.protocol).split(",")[0].trim();
    const host   = (req.headers["x-forwarded-host"] as string) ?? (req.get("host") ?? "localhost");
    const origin = `${proto}://${host}`;

    const annehmenUrl = `${origin}/api/nachruecker/annehmen?token=${token}`;
    const ablehnenUrl = `${origin}/api/nachruecker/ablehnen?token=${token}`;

    await db
      .update(wartelisteTable)
      .set({
        nachruecker_token:         token,
        nachruecker_eingeladen_am: new Date(),
        nachruecker_status:        "eingeladen",
      })
      .where(eq(wartelisteTable.id, id));

    res.json({ ok: true });

    sendNachrueckerEinladung({ to: eintrag.email, annehmenUrl, ablehnenUrl })
      .catch((err: unknown) => {
        req.log.error({ err, email: eintrag.email }, "Nachrücker-Einladungsmail fehlgeschlagen");
      });
  } catch (err) {
    req.log.error(err, "admin warteliste einladen failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ─── GET /nachruecker/annehmen — Token annehmen ────────────────────────────

router.get("/nachruecker/annehmen", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : null;
  if (!token) {
    res.redirect("/?nachruecker=ungueltig");
    return;
  }

  try {
    const rows = await db
      .select()
      .from(wartelisteTable)
      .where(eq(wartelisteTable.nachruecker_token, token))
      .limit(1);

    if (rows.length === 0) {
      res.redirect("/?nachruecker=ungueltig");
      return;
    }

    const eintrag = rows[0];

    if (eintrag.nachruecker_status === "abgelehnt") {
      res.redirect("/?nachruecker=abgelehnt");
      return;
    }

    if (eintrag.nachruecker_status === "angemeldet") {
      res.redirect("/anmeldung?nachruecker=bereits_angemeldet");
      return;
    }

    await db
      .update(wartelisteTable)
      .set({ nachruecker_status: "angenommen" })
      .where(eq(wartelisteTable.id, eintrag.id));

    const emailParam = encodeURIComponent(eintrag.email);
    res.redirect(`/anmeldung?email=${emailParam}&token=${token}`);
  } catch (err) {
    req.log.error(err, "nachruecker annehmen failed");
    res.redirect("/?nachruecker=fehler");
  }
});

// ─── GET /nachruecker/ablehnen — Token ablehnen ────────────────────────────

router.get("/nachruecker/ablehnen", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : null;
  if (!token) {
    res.redirect("/");
    return;
  }

  try {
    const rows = await db
      .select()
      .from(wartelisteTable)
      .where(eq(wartelisteTable.nachruecker_token, token))
      .limit(1);

    if (rows.length > 0) {
      await db
        .update(wartelisteTable)
        .set({ nachruecker_status: "abgelehnt" })
        .where(eq(wartelisteTable.id, rows[0].id));
    }

    res.redirect("/?nachruecker=abgelehnt");
  } catch (err) {
    req.log.error(err, "nachruecker ablehnen failed");
    res.redirect("/");
  }
});

export default router;
