import { Router, type Request, type Response } from "express";
import * as XLSX from "xlsx";
import { db, anmeldungenTable, wartelisteTable } from "@workspace/db";
import { isNull, sum, ne, and } from "drizzle-orm";
import { SERVER_CONFIG } from "../config.js";

const router = Router();
const SECRET = process.env.ADMIN_SECRET ?? "emmerich-orga-stats-2026";

function requireAdmin(req: Request, res: Response): boolean {
  const provided = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (provided !== SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

function deISO(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso as string);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

function parsePersonen(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string");
}

function parseNummern(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  return raw.join(", ");
}

// GET /api/admin/export — Excel-Export aller relevanten Daten
router.get("/admin/export", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  try {
    const [anmeldungen, warteliste] = await Promise.all([
      db.select().from(anmeldungenTable).where(and(ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_DEMO_EMAIL), ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_FARZIN_EMAIL))).orderBy(anmeldungenTable.created_at),
      db.select().from(wartelisteTable).orderBy(wartelisteTable.created_at),
    ]);

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Anmeldungen ──────────────────────────────────────────────────

    const anmeldungenRows: (string | number)[][] = [
      [
        "ID", "E-Mail", "Telefon", "Personen-Anzahl", "Namen",
        "Bezahlweg", "Betrag (€)", "Ticket-Nummern",
        "Angemeldet am", "Bezahlt am", "Tickets versendet am",
        "Storniert", "Storniert am",
      ],
    ];

    for (const row of anmeldungen) {
      const personen = parsePersonen(row.personen);
      const bezahlweg = row.bezahlweg === "ueberweisung" ? "Überweisung" : row.bezahlweg === "paypal" ? "PayPal" : (row.bezahlweg ?? "");
      anmeldungenRows.push([
        row.id,
        row.email,
        row.telefon ?? "",
        row.personen_anzahl,
        personen.join(", "),
        bezahlweg,
        row.betrag_gesamt,
        parseNummern(row.ticket_nummern),
        deISO(row.created_at),
        deISO(row.bezahlt_am),
        deISO(row.ticket_versendet_am),
        row.storniert_am ? "Ja" : "Nein",
        deISO(row.storniert_am),
      ]);
    }

    const wsAnmeldungen = XLSX.utils.aoa_to_sheet(anmeldungenRows);

    // Spaltenbreiten
    wsAnmeldungen["!cols"] = [
      { wch: 6 },  // ID
      { wch: 30 }, // E-Mail
      { wch: 16 }, // Telefon
      { wch: 16 }, // Personen-Anzahl
      { wch: 40 }, // Namen
      { wch: 14 }, // Bezahlweg
      { wch: 10 }, // Betrag
      { wch: 20 }, // Ticket-Nummern
      { wch: 18 }, // Angemeldet am
      { wch: 18 }, // Bezahlt am
      { wch: 20 }, // Tickets versendet
      { wch: 10 }, // Storniert
      { wch: 18 }, // Storniert am
    ];

    XLSX.utils.book_append_sheet(wb, wsAnmeldungen, "Anmeldungen");

    // ── Sheet 2: Warteliste ───────────────────────────────────────────────────

    const wartelisteRows: (string | number)[][] = [
      [
        "ID", "E-Mail", "Eingetragen am",
        "Bestätigung versendet am", "Nachrücker-Status", "Eingeladen am",
      ],
    ];

    const statusLabel: Record<string, string> = {
      eingeladen: "Eingeladen",
      angenommen: "Angenommen (noch nicht angemeldet)",
      angemeldet: "Angemeldet",
      abgelehnt:  "Abgelehnt",
    };

    for (const row of warteliste) {
      wartelisteRows.push([
        row.id,
        row.email,
        deISO(row.created_at),
        deISO(row.bestaetigung_versendet_am),
        statusLabel[row.nachruecker_status ?? ""] ?? (row.nachruecker_status ?? "—"),
        deISO(row.nachruecker_eingeladen_am),
      ]);
    }

    const wsWarteliste = XLSX.utils.aoa_to_sheet(wartelisteRows);
    wsWarteliste["!cols"] = [
      { wch: 6 },  // ID
      { wch: 30 }, // E-Mail
      { wch: 20 }, // Eingetragen am
      { wch: 24 }, // Bestätigung
      { wch: 32 }, // Status
      { wch: 20 }, // Eingeladen am
    ];

    XLSX.utils.book_append_sheet(wb, wsWarteliste, "Warteliste");

    // ── Sheet 3: Zusammenfassung ──────────────────────────────────────────────

    const aktive        = anmeldungen.filter(r => !r.storniert_am);
    const stornierte    = anmeldungen.filter(r => r.storniert_am);
    const bezahlt       = aktive.filter(r => r.bezahlt_am);
    const sumPersonen   = aktive.reduce((s, r) => s + r.personen_anzahl, 0);
    const sumBetrag     = aktive.reduce((s, r) => s + r.betrag_gesamt, 0);
    const sumBezahlt    = bezahlt.reduce((s, r) => s + r.betrag_gesamt, 0);

    const nachrueckerVerteilung: Record<string, number> = {};
    for (const row of warteliste) {
      const st = row.nachruecker_status ?? "offen";
      nachrueckerVerteilung[st] = (nachrueckerVerteilung[st] ?? 0) + 1;
    }

    const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

    const zusammenfassung: (string | number)[][] = [
      ["Exportiert am", now],
      [],
      ["── Anmeldungen ──"],
      ["Anmeldungen gesamt (inkl. Stornos)", anmeldungen.length],
      ["Aktive Anmeldungen", aktive.length],
      ["Stornierte Anmeldungen", stornierte.length],
      ["Angemeldete Personen", sumPersonen],
      ["Gesamtbetrag aktiv (€)", sumBetrag],
      ["Davon bezahlt (€)", sumBezahlt],
      ["Ausstehend (€)", sumBetrag - sumBezahlt],
      ["Anmeldungen bezahlt", bezahlt.length],
      ["Anmeldungen unbezahlt", aktive.length - bezahlt.length],
      [],
      ["── Warteliste ──"],
      ["Warteliste gesamt", warteliste.length],
      ...Object.entries(nachrueckerVerteilung).map(([k, v]) => [
        `  ${statusLabel[k] ?? k}`, v,
      ]),
    ];

    const wsZusammenfassung = XLSX.utils.aoa_to_sheet(zusammenfassung);
    wsZusammenfassung["!cols"] = [{ wch: 38 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, wsZusammenfassung, "Zusammenfassung");

    // ── Buffer schreiben & senden ─────────────────────────────────────────────

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `emmerich-boomt-export-${dateStr}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(buf);
  } catch (err) {
    req.log.error(err, "admin export failed");
    res.status(500).json({ error: "Export fehlgeschlagen" });
  }
});

export default router;
