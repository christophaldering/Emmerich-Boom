import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db, wartelisteTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendWartelisteBestaetigung, sendNachrueckerEinladung } from "../services/mailer.js";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "emmerich-orga-stats-2026";

const wartelisteSchema = z.object({
  email: z.string().email().max(300),
  name: z.string().min(1).max(120),
  anzahl_karten: z.number().int().min(1).max(6),
});

// ─── POST /warteliste — Eintragen ──────────────────────────────────────────

router.post("/warteliste", async (req, res) => {
  const parsed = wartelisteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige E-Mail-Adresse" });
    return;
  }

  const { email, name, anzahl_karten } = parsed.data;

  try {
    await db.insert(wartelisteTable).values({ email, name, anzahl_karten });

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
        name:                      wartelisteTable.name,
        anzahl_karten:             wartelisteTable.anzahl_karten,
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

// ─── POST /admin/warteliste — Manuell anlegen ─────────────────────────────

const adminWartelisteCreateSchema = z.object({
  name:          z.string().min(1).max(120),
  email:         z.string().email().max(300),
  anzahl_karten: z.number().int().min(1).max(6),
});

router.post("/admin/warteliste", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = adminWartelisteCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe" });
    return;
  }

  const { name, email, anzahl_karten } = parsed.data;

  try {
    await db.insert(wartelisteTable).values({ name, email, anzahl_karten });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (
      typeof err === "object" && err !== null && "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      res.status(409).json({ error: "already_on_list" });
      return;
    }
    req.log.error(err, "admin warteliste create failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ─── PATCH /admin/warteliste/:id — Bearbeiten ─────────────────────────────

const adminWartelistePatchSchema = z.object({
  name:          z.string().min(1).max(120).optional(),
  email:         z.string().email().max(300).optional(),
  anzahl_karten: z.number().int().min(1).max(6).optional(),
});

router.patch("/admin/warteliste/:id", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Ungültige ID" });
    return;
  }

  const parsed = adminWartelistePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe" });
    return;
  }

  const fields = parsed.data;
  if (Object.keys(fields).length === 0) {
    res.status(400).json({ error: "Keine Felder angegeben" });
    return;
  }

  try {
    const updated = await db
      .update(wartelisteTable)
      .set(fields)
      .where(eq(wartelisteTable.id, id))
      .returning({ id: wartelisteTable.id });

    if (updated.length === 0) {
      res.status(404).json({ error: "Eintrag nicht gefunden" });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    if (
      typeof err === "object" && err !== null && "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      res.status(409).json({ error: "already_on_list" });
      return;
    }
    req.log.error(err, "admin warteliste patch failed");
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
    const host   = (req.headers["x-forwarded-host"] as string) ?? (req.get("host") ?? "");
    const origin = process.env.SITE_URL ?? (host ? `${proto}://${host}` : "https://emmerich-boomt.de");

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

    // Frist: 72 Stunden ab jetzt als lesbarer Zeitpunkt
    const fristDatum = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const fristText = fristDatum.toLocaleString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    }) + " Uhr (72 Stunden)";

    sendNachrueckerEinladung({ to: eintrag.email, annehmenUrl, ablehnenUrl, fristText })
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

    // Nur 'eingeladen' ist gültig; alles andere (abgelehnt, angenommen ohne Token, etc.) → ungültig
    if (eintrag.nachruecker_status !== "eingeladen" && eintrag.nachruecker_status !== "angenommen") {
      res.redirect("/?nachruecker=ungueltig");
      return;
    }

    // Idempotent: nur updaten wenn noch 'eingeladen'
    if (eintrag.nachruecker_status === "eingeladen") {
      await db
        .update(wartelisteTable)
        .set({ nachruecker_status: "angenommen" })
        .where(eq(wartelisteTable.id, eintrag.id));
    }

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

    await db
      .update(wartelisteTable)
      .set({ nachruecker_status: "abgelehnt" })
      .where(eq(wartelisteTable.id, rows[0].id));

    res.redirect("/?nachruecker=abgelehnt");
  } catch (err) {
    req.log.error(err, "nachruecker ablehnen failed");
    res.redirect("/?nachruecker=fehler");
  }
});

export default router;
