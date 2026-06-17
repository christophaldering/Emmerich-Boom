import { Router, type Request, type Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import { db, anmeldungTicketsTable, thekeProfileTable, thekeBotschaftenTable, thekeFotosTable, thekeVerteilerTable } from "@workspace/db";
import { eq, desc, and, isNotNull, isNull, sql } from "drizzle-orm";
import { Client } from "@replit/object-storage";
import { SERVER_CONFIG } from "../config.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "video/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});
const audioUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "video/webm"];
    cb(null, allowed.includes(file.mimetype));
  },
});

function getObjectStorage() {
  return new Client();
}

async function storeFile(buffer: Buffer, key: string, _mimeType: string): Promise<void> {
  const client = getObjectStorage();
  const { ok, error } = await client.uploadFromBytes(key, buffer);
  if (!ok) throw new Error(`Upload fehlgeschlagen: ${error}`);
}

async function verkleinereBild(buffer: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  try {
    const out = await sharp(buffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return { buffer: out, ext: "jpg" };
  } catch {
    return { buffer, ext: "jpg" };
  }
}

async function deleteFile(key: string): Promise<void> {
  const client = getObjectStorage();
  await client.delete(key);
}

async function getFileBytes(key: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  const client = getObjectStorage();
  const { ok, value, error } = await client.downloadAsBytes(key);
  if (!ok || !value) {
    if (error) return null;
    return null;
  }
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", webm: "audio/webm",
    ogg: "audio/ogg", mp4: "audio/mp4", mp3: "audio/mpeg",
  };
  const contentType = mimeMap[ext] ?? "application/octet-stream";
  const bytes: Uint8Array = Array.isArray(value) ? Buffer.concat(value as Buffer[]) : value as unknown as Uint8Array;
  return { data: bytes, contentType };
}

async function validateCode(code: string) {
  if (!code || code.length !== 16) return null;
  const rows = await db
    .select()
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code.toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

function getCode(req: Request): string | null {
  const fromHeader = req.headers["x-theke-token"];
  if (typeof fromHeader === "string" && fromHeader.length === 16) return fromHeader.toUpperCase();
  const fromBody = (req.body as Record<string, unknown>)?.["t"];
  if (typeof fromBody === "string" && fromBody.length === 16) return fromBody.toUpperCase();
  return null;
}

// ─── POST /api/theke/auth ────────────────────────────────────────────────────
router.post("/theke/auth", async (req: Request, res: Response) => {
  const body = req.body as { t?: string; anzeige_name?: string };
  const code = typeof body.t === "string" ? body.t.toUpperCase() : null;
  if (!code) { res.status(400).json({ error: "Kein Code" }); return; }

  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültiger Code" }); return; }

  let [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);

  if (!profile) {
    [profile] = await db
      .insert(thekeProfileTable)
      .values({
        anmeldung_ticket_id: ticket.id,
        anzeige_name: body.anzeige_name?.trim() || ticket.person_name,
        bestaetigt: false,
      })
      .returning();
  } else if (body.anzeige_name && body.anzeige_name.trim() !== profile.anzeige_name) {
    [profile] = await db
      .update(thekeProfileTable)
      .set({ anzeige_name: body.anzeige_name.trim(), updated_at: new Date() })
      .where(eq(thekeProfileTable.id, profile!.id))
      .returning();
  }

  const [verteilerRow] = await db
    .select({ email: thekeVerteilerTable.email })
    .from(thekeVerteilerTable)
    .where(and(
      eq(thekeVerteilerTable.anmeldung_ticket_id, ticket.id),
      isNull(thekeVerteilerTable.abgemeldet_am),
    ))
    .limit(1);

  res.json({
    ticket: {
      id: ticket.id,
      person_name: ticket.person_name,
      ticket_nummer: ticket.ticket_nummer,
    },
    profile: profile!,
    verteiler: verteilerRow ? { email: verteilerRow.email, opted_in: true } : null,
  });
});

// ─── PUT /api/theke/profil ───────────────────────────────────────────────────
const profilSchema = z.object({
  anzeige_name:    z.string().min(2).max(80).optional(),
  vorstellung:     z.string().max(500).nullable().optional(),
  jahr_1985:       z.string().max(200).nullable().optional(),
  lauter_song:     z.string().max(200).nullable().optional(),
  f_tontraeger:    z.string().max(100).nullable().optional(),
  f_abends:        z.string().max(100).nullable().optional(),
  f_untersatz:     z.string().max(100).nullable().optional(),
  f_musik:         z.string().max(100).nullable().optional(),
  f_getraenk:      z.string().max(100).nullable().optional(),
  foto_frueher_jahr: z.number().int().min(1940).max(2010).nullable().optional(),
  foto_heute_jahr:   z.number().int().min(1940).max(2030).nullable().optional(),
});

router.put("/theke/profil", async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const parsed = profilSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Ungültige Felder" }); return; }

  try {
    const [profile] = await db
      .select()
      .from(thekeProfileTable)
      .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
      .limit(1);
    if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }

    // Content fields require consent A (sichtbarkeit_zugestimmt_am)
    const CONTENT_FIELDS = ["vorstellung", "jahr_1985", "lauter_song", "f_tontraeger", "f_abends", "f_untersatz", "f_musik", "f_getraenk", "foto_frueher_jahr", "foto_heute_jahr"] as const;
    const hasContentFields = CONTENT_FIELDS.some(f => parsed.data[f] !== undefined);
    if (hasContentFields && !profile.sichtbarkeit_zugestimmt_am) {
      res.status(403).json({ error: "Bitte zuerst Einwilligung A setzen." });
      return;
    }

    const [updated] = await db
      .update(thekeProfileTable)
      .set({ ...parsed.data, updated_at: new Date() })
      .where(eq(thekeProfileTable.id, profile.id))
      .returning();

    res.json({ ok: true, profile: updated });
  } catch (err) {
    req.log.error(err, "PUT /theke/profil db error");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// ─── POST /api/theke/einwilligung ────────────────────────────────────────────
router.post("/theke/einwilligung", async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const body = req.body as { a?: boolean; b?: boolean; b_email?: string; c?: boolean; d?: boolean };

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }

  const now = new Date();
  const updates: Partial<typeof thekeProfileTable.$inferSelect> = {
    updated_at: now,
  };

  if (body.a === true && !profile.sichtbarkeit_zugestimmt_am) {
    updates.sichtbarkeit_zugestimmt_am = now;
    updates.bestaetigt = true;
  }
  if (body.a === false) {
    updates.sichtbarkeit_zugestimmt_am = null;
    updates.bestaetigt = false;
  }
  if (body.c !== undefined) {
    updates.abendfotos_ok = body.c;
  }
  if (body.d !== undefined) {
    updates.tafel_ok = body.d;
    if (body.d === true && !profile.tafel_zugestimmt_am) updates.tafel_zugestimmt_am = now;
    if (body.d === false) updates.tafel_zugestimmt_am = null;
  }

  const [updated] = await db
    .update(thekeProfileTable)
    .set(updates)
    .where(eq(thekeProfileTable.id, profile.id))
    .returning();

  let verteilerResult: { email: string; opted_in: boolean } | null = null;

  if (body.b === true && body.b_email) {
    const email = body.b_email.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const [existing] = await db
        .select({ id: thekeVerteilerTable.id })
        .from(thekeVerteilerTable)
        .where(eq(thekeVerteilerTable.anmeldung_ticket_id, ticket.id))
        .limit(1);
      if (existing) {
        await db
          .update(thekeVerteilerTable)
          .set({ email, name: profile.anzeige_name, einwilligung_am: now, abgemeldet_am: null })
          .where(eq(thekeVerteilerTable.id, existing.id));
      } else {
        await db
          .insert(thekeVerteilerTable)
          .values({ email, name: profile.anzeige_name, anmeldung_ticket_id: ticket.id, einwilligung_am: now })
          .onConflictDoNothing();
      }
      verteilerResult = { email, opted_in: true };
    }
  } else if (body.b === false) {
    await db
      .update(thekeVerteilerTable)
      .set({ abgemeldet_am: now })
      .where(and(
        eq(thekeVerteilerTable.anmeldung_ticket_id, ticket.id),
        isNull(thekeVerteilerTable.abgemeldet_am),
      ));
  }

  res.json({ ok: true, profile: updated, verteiler: verteilerResult });
});

// ─── POST /api/theke/foto/profil-frueher ────────────────────────────────────
router.post("/theke/foto/profil-frueher", upload.single("foto"), async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }
  if (!req.file) { res.status(400).json({ error: "Kein Bild" }); return; }

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }
  if (!profile.sichtbarkeit_zugestimmt_am) { res.status(403).json({ error: "Bitte zuerst das Häkchen 'darf sichtbar gespeichert werden' setzen." }); return; }

  const verkleinert = await verkleinereBild(req.file.buffer);
  const key = `theke/foto/${randomUUID()}.${verkleinert.ext}`;
  try {
    await storeFile(verkleinert.buffer, key, "image/jpeg");
  } catch {
    res.status(500).json({ error: "Foto konnte nicht gespeichert werden — Speicher nicht verfügbar." }); return;
  }

  if (profile.foto_frueher_key) {
    await deleteFile(profile.foto_frueher_key).catch(() => {});
  }

  const jahr = parseInt(String((req.body as Record<string, unknown>)?.["jahr"] ?? ""), 10);
  const [updated] = await db
    .update(thekeProfileTable)
    .set({
      foto_frueher_key:  key,
      foto_frueher_jahr: isNaN(jahr) ? null : jahr,
      updated_at:        new Date(),
    })
    .where(eq(thekeProfileTable.id, profile.id))
    .returning();

  res.json({ ok: true, key, profile: updated });
});

// ─── POST /api/theke/foto/profil-heute ──────────────────────────────────────
router.post("/theke/foto/profil-heute", upload.single("foto"), async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }
  if (!req.file) { res.status(400).json({ error: "Kein Bild" }); return; }

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }
  if (!profile.sichtbarkeit_zugestimmt_am) { res.status(403).json({ error: "Bitte zuerst das Häkchen 'darf sichtbar gespeichert werden' setzen." }); return; }

  const verkleinert = await verkleinereBild(req.file.buffer);
  const key = `theke/foto/${randomUUID()}.${verkleinert.ext}`;
  try {
    await storeFile(verkleinert.buffer, key, "image/jpeg");
  } catch {
    res.status(500).json({ error: "Foto konnte nicht gespeichert werden — Speicher nicht verfügbar." }); return;
  }

  if (profile.foto_heute_key) {
    await deleteFile(profile.foto_heute_key).catch(() => {});
  }

  const jahr = parseInt(String((req.body as Record<string, unknown>)?.["jahr"] ?? ""), 10);
  const [updated] = await db
    .update(thekeProfileTable)
    .set({
      foto_heute_key:  key,
      foto_heute_jahr: isNaN(jahr) ? null : jahr,
      updated_at:      new Date(),
    })
    .where(eq(thekeProfileTable.id, profile.id))
    .returning();

  res.json({ ok: true, key, profile: updated });
});

// ─── DELETE /api/theke/foto/profil/:slot  (slot = frueher | heute) ───────────
router.delete("/theke/foto/profil/:slot", async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const slot = req.params["slot"];
  if (slot !== "frueher" && slot !== "heute") { res.status(400).json({ error: "Ungültiger Slot" }); return; }

  const [profile] = await db.select().from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id)).limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }

  const key = slot === "frueher" ? profile.foto_frueher_key : profile.foto_heute_key;
  if (key) await deleteFile(key).catch(() => {});

  const updates = slot === "frueher"
    ? { foto_frueher_key: null, foto_frueher_jahr: null, updated_at: new Date() }
    : { foto_heute_key: null, foto_heute_jahr: null, updated_at: new Date() };

  const [updated] = await db.update(thekeProfileTable).set(updates)
    .where(eq(thekeProfileTable.id, profile.id)).returning();
  res.json({ ok: true, profile: updated });
});

// ─── POST /api/theke/foto/galerie ────────────────────────────────────────────
router.post("/theke/foto/galerie", upload.single("foto"), async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }
  if (!req.file) { res.status(400).json({ error: "Kein Bild" }); return; }

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }
  if (!profile.sichtbarkeit_zugestimmt_am) { res.status(403).json({ error: "Bitte zuerst das Häkchen 'darf sichtbar gespeichert werden' setzen." }); return; }

  const verkleinert = await verkleinereBild(req.file.buffer);
  const key = `theke/foto/${randomUUID()}.${verkleinert.ext}`;
  try {
    await storeFile(verkleinert.buffer, key, "image/jpeg");
  } catch {
    res.status(500).json({ error: "Foto konnte nicht gespeichert werden — Speicher nicht verfügbar." }); return;
  }

  const body = req.body as Record<string, unknown>;
  const bildunterschrift = typeof body["bildunterschrift"] === "string" ? body["bildunterschrift"].trim().slice(0, 120) : null;
  const jahr = parseInt(String(body["jahr"] ?? ""), 10);

  const [foto] = await db
    .insert(thekeFotosTable)
    .values({
      anmeldung_ticket_id: ticket.id,
      datei_key:           key,
      bildunterschrift:    bildunterschrift || null,
      jahr:                isNaN(jahr) ? null : jahr,
      sichtbar_ok:         true,
    })
    .returning();

  res.json({ ok: true, foto });
});

// ─── DELETE /api/theke/foto/:id ──────────────────────────────────────────────
router.delete("/theke/foto/:id", async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  const [foto] = await db
    .select()
    .from(thekeFotosTable)
    .where(and(eq(thekeFotosTable.id, id), eq(thekeFotosTable.anmeldung_ticket_id, ticket.id)))
    .limit(1);
  if (!foto) { res.status(404).json({ error: "Nicht gefunden" }); return; }

  await deleteFile(foto.datei_key).catch(() => {});
  await db.delete(thekeFotosTable).where(eq(thekeFotosTable.id, id));

  res.json({ ok: true });
});

// ─── POST /api/theke/audio ───────────────────────────────────────────────────
router.post("/theke/audio", audioUpload.single("audio"), async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }
  if (!req.file) { res.status(400).json({ error: "Keine Audiodatei" }); return; }

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }
  if (!profile.sichtbarkeit_zugestimmt_am) { res.status(403).json({ error: "Bitte zuerst das Häkchen 'darf sichtbar gespeichert werden' setzen." }); return; }

  const mime = req.file.mimetype;
  const ext = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "mp4" : mime.includes("mp3") || mime.includes("mpeg") ? "mp3" : "webm";
  const key = `theke/audio/${randomUUID()}.${ext}`;
  try {
    await storeFile(req.file.buffer, key, mime);
  } catch {
    res.status(500).json({ error: "Sprachnachricht konnte nicht gespeichert werden — Speicher nicht verfügbar." }); return;
  }

  const body = req.body as Record<string, unknown>;
  const dauer = parseInt(String(body["dauer_sek"] ?? "0"), 10);

  const vorhandene = await db
    .select()
    .from(thekeBotschaftenTable)
    .where(eq(thekeBotschaftenTable.anmeldung_ticket_id, ticket.id));

  for (const b of vorhandene) {
    await deleteFile(b.datei_key).catch(() => {});
    await db.delete(thekeBotschaftenTable).where(eq(thekeBotschaftenTable.id, b.id));
  }

  const [botschaft] = await db
    .insert(thekeBotschaftenTable)
    .values({
      anmeldung_ticket_id: ticket.id,
      datei_key:           key,
      dauer_sek:           isNaN(dauer) ? 0 : Math.min(dauer, 60),
      abspielen_ok:        true,
    })
    .returning();

  res.json({ ok: true, botschaft });
});

// ─── DELETE /api/theke/audio/:id ─────────────────────────────────────────────
router.delete("/theke/audio/:id", async (req: Request, res: Response) => {
  const code = getCode(req);
  if (!code) { res.status(400).json({ error: "Kein Token" }); return; }
  const ticket = await validateCode(code);
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  const [botschaft] = await db
    .select()
    .from(thekeBotschaftenTable)
    .where(and(eq(thekeBotschaftenTable.id, id), eq(thekeBotschaftenTable.anmeldung_ticket_id, ticket.id)))
    .limit(1);
  if (!botschaft) { res.status(404).json({ error: "Nicht gefunden" }); return; }

  await deleteFile(botschaft.datei_key).catch(() => {});
  await db.delete(thekeBotschaftenTable).where(eq(thekeBotschaftenTable.id, id));

  res.json({ ok: true });
});

// ─── GET /api/theke/datei/*key ────────────────────────────────────────────────
router.get("/theke/datei/*key", async (req: Request, res: Response) => {
  const code = req.headers["x-theke-token"] as string | undefined ?? req.query["t"] as string | undefined;
  const ticket = code ? await validateCode(code) : null;
  if (!ticket) { res.status(401).json({ error: "Zugang verweigert" }); return; }

  const raw = (req.params as Record<string, unknown>)["key"];
  const urlPath = Array.isArray(raw)
    ? raw.map(s => decodeURIComponent(String(s))).join("/")
    : decodeURIComponent(String(raw ?? ""));
  if (!urlPath.startsWith("theke/")) { res.status(400).json({ error: "Ungültiger Pfad" }); return; }

  const result = await getFileBytes(urlPath);
  if (!result) { res.status(404).json({ error: "Datei nicht gefunden" }); return; }

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
  res.send(Buffer.from(result.data));
});

// ─── POST /api/theke/ping ─────────────────────────────────────────────────────
router.post("/theke/ping", async (req: Request, res: Response) => {
  const code = req.headers["x-theke-token"] as string | undefined ?? req.query["t"] as string | undefined;
  const ticket = code ? await validateCode(code) : null;
  if (!ticket) { res.status(401).json({ error: "Zugang verweigert" }); return; }
  try {
    await db
      .update(thekeProfileTable)
      .set({ zuletzt_gesehen_am: new Date() })
      .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id));
  } catch (err) {
    req.log.error(err, "theke/ping failed");
  }
  res.json({ ok: true });
});

// ─── GET /api/theke/feed ──────────────────────────────────────────────────────
router.get("/theke/feed", async (req: Request, res: Response) => {
  const code = req.headers["x-theke-token"] as string | undefined ?? req.query["t"] as string | undefined;
  const ticket = code ? await validateCode(code) : null;
  if (!ticket) { res.status(401).json({ error: "Zugang verweigert" }); return; }

  const profiles = await db
    .select()
    .from(thekeProfileTable)
    .where(and(
      isNotNull(thekeProfileTable.sichtbarkeit_zugestimmt_am),
      sql`${thekeProfileTable.anmeldung_ticket_id} NOT IN (SELECT id FROM anmeldung_tickets WHERE ticket_code = ${SERVER_CONFIG.THEKE_DEMO_CODE})`,
    ))
    .orderBy(desc(thekeProfileTable.updated_at));

  const profileIds = profiles.map(p => p.anmeldung_ticket_id);
  const fotos = profileIds.length > 0
    ? await db.select().from(thekeFotosTable).where(sql`${thekeFotosTable.anmeldung_ticket_id} = ANY(ARRAY[${sql.raw(profileIds.join(","))}]::int[])`)
    : [];
  const botschaften = profileIds.length > 0
    ? await db.select({ anmeldung_ticket_id: thekeBotschaftenTable.anmeldung_ticket_id, id: thekeBotschaftenTable.id })
        .from(thekeBotschaftenTable)
        .where(sql`${thekeBotschaftenTable.anmeldung_ticket_id} = ANY(ARRAY[${sql.raw(profileIds.join(","))}]::int[]) AND ${thekeBotschaftenTable.abspielen_ok} = TRUE`)
    : [];

  const fotosByTicket = new Map<number, typeof fotos>();
  for (const f of fotos) {
    const list = fotosByTicket.get(f.anmeldung_ticket_id) ?? [];
    list.push(f);
    fotosByTicket.set(f.anmeldung_ticket_id, list);
  }
  const botschaftenSet = new Set(botschaften.map(b => b.anmeldung_ticket_id));

  const result = profiles.map(p => ({
    ...p,
    fotos: fotosByTicket.get(p.anmeldung_ticket_id) ?? [],
    hat_botschaft: botschaftenSet.has(p.anmeldung_ticket_id),
  }));

  res.json(result);
});

// ─── GET /api/theke/mein-profil ───────────────────────────────────────────────
router.get("/theke/mein-profil", async (req: Request, res: Response) => {
  const code = req.headers["x-theke-token"] as string | undefined ?? req.query["t"] as string | undefined;
  const ticket = code ? await validateCode(code) : null;
  if (!ticket) { res.status(401).json({ error: "Ungültig" }); return; }

  const [profile] = await db
    .select()
    .from(thekeProfileTable)
    .where(eq(thekeProfileTable.anmeldung_ticket_id, ticket.id))
    .limit(1);
  if (!profile) { res.status(404).json({ error: "Kein Profil" }); return; }

  const fotos = await db
    .select()
    .from(thekeFotosTable)
    .where(eq(thekeFotosTable.anmeldung_ticket_id, ticket.id))
    .orderBy(desc(thekeFotosTable.created_at));

  const botschaft = await db
    .select()
    .from(thekeBotschaftenTable)
    .where(eq(thekeBotschaftenTable.anmeldung_ticket_id, ticket.id))
    .limit(1);

  res.json({
    ticket: { id: ticket.id, person_name: ticket.person_name, ticket_nummer: ticket.ticket_nummer },
    profile,
    fotos,
    botschaft: botschaft[0] ?? null,
  });
});

// ─── GET /api/theke/band ──────────────────────────────────────────────────────
router.get("/theke/band", async (req: Request, res: Response) => {
  const code = req.headers["x-theke-token"] as string | undefined ?? req.query["t"] as string | undefined;
  const ticket = code ? await validateCode(code) : null;
  if (!ticket) { res.status(401).json({ error: "Zugang verweigert" }); return; }

  const botschaften = await db
    .select({
      id:              thekeBotschaftenTable.id,
      datei_key:       thekeBotschaftenTable.datei_key,
      dauer_sek:       thekeBotschaftenTable.dauer_sek,
      anmeldung_ticket_id: thekeBotschaftenTable.anmeldung_ticket_id,
      created_at:      thekeBotschaftenTable.created_at,
      anzeige_name:    thekeProfileTable.anzeige_name,
    })
    .from(thekeBotschaftenTable)
    .innerJoin(thekeProfileTable, eq(thekeProfileTable.anmeldung_ticket_id, thekeBotschaftenTable.anmeldung_ticket_id))
    .where(and(
      eq(thekeBotschaftenTable.abspielen_ok, true),
      isNotNull(thekeProfileTable.sichtbarkeit_zugestimmt_am),
      sql`${thekeBotschaftenTable.anmeldung_ticket_id} NOT IN (SELECT id FROM anmeldung_tickets WHERE ticket_code = ${SERVER_CONFIG.THEKE_DEMO_CODE})`,
    ))
    .orderBy(desc(thekeBotschaftenTable.created_at));

  res.json(botschaften);
});

export default router;
