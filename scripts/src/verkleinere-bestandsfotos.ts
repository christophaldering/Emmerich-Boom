// Einmaliges Migrationsskript: verkleinert ALLE bereits hochgeladenen Theke-Fotos
// im Object-Storage auf max. 1600px und re-komprimiert sie. Format & Key bleiben
// erhalten (kein DB-Eingriff). Idempotent: schreibt nur zurück, wenn kleiner.
//
// Ausführen:  pnpm --filter @workspace/scripts run verkleinere-bestandsfotos

import sharp from "sharp";
import { Client } from "@replit/object-storage";
import { db, thekeProfileTable, thekeFotosTable } from "@workspace/db";

const MAX_KANTE = 1600;
const SKIP_UNTER_BYTES = 300_000; // Dateien unter ~300 KB gar nicht erst anfassen

const storage = new Client();

const fmtKB = (n: number) => `${(n / 1024).toFixed(0)} KB`;

async function ladeBytes(key: string): Promise<Buffer | null> {
  const { ok, value } = await storage.downloadAsBytes(key);
  if (!ok || !value) return null;
  return Array.isArray(value) ? Buffer.concat(value as Buffer[]) : Buffer.from(value as Uint8Array);
}

async function verkleinere(buffer: Buffer, ext: string): Promise<Buffer | null> {
  const p = sharp(buffer)
    .rotate()
    .resize(MAX_KANTE, MAX_KANTE, { fit: "inside", withoutEnlargement: true });
  switch (ext) {
    case "jpg":
    case "jpeg": return p.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    case "png":  return p.png({ compressionLevel: 9 }).toBuffer();
    case "webp": return p.webp({ quality: 80 }).toBuffer();
    default:     return null; // gif u.a. überspringen
  }
}

async function main() {
  const profile = await db
    .select({ frueher: thekeProfileTable.foto_frueher_key, heute: thekeProfileTable.foto_heute_key })
    .from(thekeProfileTable);
  const galerie = await db
    .select({ key: thekeFotosTable.datei_key })
    .from(thekeFotosTable);

  const keys = new Set<string>();
  for (const r of profile) { if (r.frueher) keys.add(r.frueher); if (r.heute) keys.add(r.heute); }
  for (const r of galerie) { if (r.key) keys.add(r.key); }

  console.log(`Gefundene Foto-Keys: ${keys.size}`);

  let bearbeitet = 0, uebersprungen = 0, fehler = 0, vorher = 0, nachher = 0;

  for (const key of keys) {
    try {
      const ext = (key.split(".").pop() ?? "").toLowerCase();
      const original = await ladeBytes(key);
      if (!original) { console.log(`  ⚠ nicht gefunden: ${key}`); fehler++; continue; }
      if (original.length < SKIP_UNTER_BYTES) { uebersprungen++; continue; }

      const klein = await verkleinere(original, ext);
      if (!klein || klein.length >= original.length) { uebersprungen++; continue; }

      const { ok, error } = await storage.uploadFromBytes(key, klein);
      if (!ok) { console.log(`  ⚠ Upload fehlgeschlagen ${key}: ${error}`); fehler++; continue; }

      vorher += original.length; nachher += klein.length; bearbeitet++;
      console.log(`  ✓ ${key}: ${fmtKB(original.length)} → ${fmtKB(klein.length)}`);
    } catch (e) {
      console.log(`  ⚠ Fehler bei ${key}: ${(e as Error).message}`); fehler++;
    }
  }

  console.log("");
  console.log(`Fertig. Verkleinert: ${bearbeitet}, übersprungen: ${uebersprungen}, Fehler: ${fehler}`);
  if (bearbeitet > 0) {
    console.log(`Gesamt: ${fmtKB(vorher)} → ${fmtKB(nachher)} (${(100 * (1 - nachher / vorher)).toFixed(0)} % gespart)`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
