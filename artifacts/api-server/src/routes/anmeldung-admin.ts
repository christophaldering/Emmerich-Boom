import { Router, type Request, type Response } from "express";
import { db, anmeldungenTable, anmeldungTicketsTable, scanLog, tickets as legacyTicketsTable } from "@workspace/db";
import { eq, sql, desc, isNull } from "drizzle-orm";
import crypto from "crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sendTicketMail } from "../services/mailer";
import { renderTicketFrontPNG } from "../services/ticket-render.js";
import { generateTicketPDF } from "../services/pdf.js";

const router = Router();
const SECRET = "emmerich-orga-stats-2026";

function requireAdmin(req: Request, res: Response): boolean {
  const provided = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (provided !== SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

function generateCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function parsePersonen(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string");
}

// GET /api/admin/anmeldungen — alle Phase-2-Anmeldungen mit Tickets
router.get("/admin/anmeldungen", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db
      .select({
        id:                   anmeldungenTable.id,
        email:                anmeldungenTable.email,
        telefon:              anmeldungenTable.telefon,
        personen_anzahl:      anmeldungenTable.personen_anzahl,
        personen:             anmeldungenTable.personen,
        bezahlweg:            anmeldungenTable.bezahlweg,
        song:                 anmeldungenTable.song,
        statement:            anmeldungenTable.statement,
        betrag_gesamt:        anmeldungenTable.betrag_gesamt,
        bezahlt_am:           anmeldungenTable.bezahlt_am,
        ticket_versendet_am:  anmeldungenTable.ticket_versendet_am,
        storniert_am:         anmeldungenTable.storniert_am,
        created_at:           anmeldungenTable.created_at,
      })
      .from(anmeldungenTable)
      .orderBy(anmeldungenTable.created_at);

    const ticketRows = await db
      .select({
        anmeldung_id:   anmeldungTicketsTable.anmeldung_id,
        ticket_nummer:  anmeldungTicketsTable.ticket_nummer,
        ticket_code:    anmeldungTicketsTable.ticket_code,
        person_name:    anmeldungTicketsTable.person_name,
      })
      .from(anmeldungTicketsTable);

    const ticketsByAnmeldung = new Map<number, typeof ticketRows>();
    for (const t of ticketRows) {
      const list = ticketsByAnmeldung.get(t.anmeldung_id) ?? [];
      list.push(t);
      ticketsByAnmeldung.set(t.anmeldung_id, list);
    }

    const result = rows.map(r => ({
      ...r,
      ticket_count: ticketsByAnmeldung.get(r.id)?.length ?? 0,
      tickets: (ticketsByAnmeldung.get(r.id) ?? []).map(t => ({
        ticket_nummer: t.ticket_nummer,
        ticket_code:   t.ticket_code,
        person_name:   t.person_name,
      })),
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err, "admin/anmeldungen list failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// POST /api/admin/anmeldungen/:id/bezahlt — Bezahlung bestätigen
router.post("/admin/anmeldungen/:id/bezahlt", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }
  try {
    const updated = await db
      .update(anmeldungenTable)
      .set({ bezahlt_am: new Date() })
      .where(eq(anmeldungenTable.id, id))
      .returning({ id: anmeldungenTable.id, bezahlt_am: anmeldungenTable.bezahlt_am });
    if (updated.length === 0) { res.status(404).json({ error: "Nicht gefunden" }); return; }
    res.json({ ok: true, bezahlt_am: updated[0]!.bezahlt_am });
  } catch (err) {
    req.log.error(err, "admin bezahlt failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// POST /api/admin/anmeldungen/:id/stornieren — Anmeldung intern stornieren (stille Aktion)
router.post("/admin/anmeldungen/:id/stornieren", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }
  try {
    const now = new Date();
    const updated = await db
      .update(anmeldungenTable)
      .set({ storniert_am: now })
      .where(eq(anmeldungenTable.id, id))
      .returning({ id: anmeldungenTable.id, storniert_am: anmeldungenTable.storniert_am });
    if (updated.length === 0) { res.status(404).json({ error: "Nicht gefunden" }); return; }
    res.json({ ok: true, storniert_am: updated[0]!.storniert_am });
  } catch (err) {
    req.log.error(err, "admin stornieren failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// POST /api/admin/anmeldungen/:id/reaktivieren — Stornierung rückgängig machen (stille Aktion)
router.post("/admin/anmeldungen/:id/reaktivieren", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }
  try {
    const updated = await db
      .update(anmeldungenTable)
      .set({ storniert_am: null })
      .where(eq(anmeldungenTable.id, id))
      .returning({ id: anmeldungenTable.id });
    if (updated.length === 0) { res.status(404).json({ error: "Nicht gefunden" }); return; }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "admin reaktivieren failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// POST /api/admin/anmeldungen/:id/tickets-versenden
// Generiert Tickets (falls noch nicht vorhanden) und sendet Mail
router.post("/admin/anmeldungen/:id/tickets-versenden", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  try {
    const anmeldungen = await db
      .select()
      .from(anmeldungenTable)
      .where(eq(anmeldungenTable.id, id))
      .limit(1);

    if (anmeldungen.length === 0) {
      res.status(404).json({ error: "Anmeldung nicht gefunden" });
      return;
    }
    const anmeldung = anmeldungen[0]!;

    if (!anmeldung.bezahlt_am) {
      res.status(400).json({ error: "Anmeldung noch nicht als bezahlt markiert" });
      return;
    }

    const personenNames = parsePersonen(anmeldung.personen);
    if (personenNames.length === 0) {
      res.status(400).json({ error: "Keine Personennamen in der Anmeldung" });
      return;
    }

    // Vorhandene Tickets laden oder neu erzeugen
    let vorhandene = await db
      .select()
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.anmeldung_id, id));

    if (vorhandene.length === 0) {
      vorhandene = await db.transaction(async (tx) => {
        // Ticket-Nummern-Zähler (id=2) atomisch sperren und inkrementieren.
        // id=1 ist der Anmeldungs-Zähler (reserviert ticket_nummern-Arrays bei Anmeldungseingang).
        // id=2 ist der unabhängige Zähler für die globale, bei Ticket-Generierung vergebene Laufnummer.
        await tx.execute(sql`
          INSERT INTO ticket_nummer_counter (id, next_nummer) VALUES (2, 1)
          ON CONFLICT (id) DO NOTHING
        `);
        const result = await tx.execute(sql`
          SELECT next_nummer FROM ticket_nummer_counter WHERE id = 2 FOR UPDATE
        `);
        const startNum = result.rows[0]!["next_nummer"] as number;
        await tx.execute(sql`
          UPDATE ticket_nummer_counter SET next_nummer = ${startNum + personenNames.length} WHERE id = 2
        `);
        const values = personenNames.map((name, i) => ({
          anmeldung_id:  id,
          person_name:   name,
          ticket_nummer: String(startNum + i),
          ticket_code:   generateCode(),
        }));
        return await tx.insert(anmeldungTicketsTable).values(values).returning();
      });
    }

    // Mail versenden
    await sendTicketMail({
      to:        anmeldung.email,
      personen:  personenNames,
      tickets:   vorhandene.map(t => ({
        nummer: t.ticket_nummer,
        code:   t.ticket_code,
        name:   t.person_name,
      })),
      bezahlweg: anmeldung.bezahlweg,
      betrag:    anmeldung.betrag_gesamt,
    });

    // Zeitstempel setzen
    const now = new Date();
    await db
      .update(anmeldungenTable)
      .set({ ticket_versendet_am: now })
      .where(eq(anmeldungenTable.id, id));
    await db
      .update(anmeldungTicketsTable)
      .set({ versendet_am: now })
      .where(eq(anmeldungTicketsTable.anmeldung_id, id));

    res.json({ ok: true, tickets_count: vorhandene.length });
  } catch (err) {
    req.log.error(err, "tickets-versenden failed");
    res.status(500).json({ error: "Ticketversand fehlgeschlagen. Bitte Serverlogs prüfen." });
  }
});

// PATCH /api/admin/anmeldungen/:id/personen — Personennamen korrigieren
router.patch("/admin/anmeldungen/:id/personen", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  const body = req.body as unknown;
  if (
    typeof body !== "object" || body === null ||
    !Array.isArray((body as Record<string, unknown>)["personen"]) ||
    !(body as Record<string, unknown[]>)["personen"].every((n: unknown) => typeof n === "string" && n.trim().length >= 2)
  ) {
    res.status(400).json({ error: "personen muss ein Array von Strings (mind. 2 Zeichen) sein" });
    return;
  }
  const neuPersonen: string[] = ((body as Record<string, string[]>)["personen"]).map(n => n.trim());

  try {
    const rows = await db
      .select({ personen_anzahl: anmeldungenTable.personen_anzahl })
      .from(anmeldungenTable)
      .where(eq(anmeldungenTable.id, id))
      .limit(1);
    if (rows.length === 0) { res.status(404).json({ error: "Nicht gefunden" }); return; }

    if (neuPersonen.length !== rows[0]!.personen_anzahl) {
      res.status(400).json({ error: `Erwartet ${rows[0]!.personen_anzahl} Namen, erhalten ${neuPersonen.length}` });
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(anmeldungenTable)
        .set({ personen: neuPersonen })
        .where(eq(anmeldungenTable.id, id));

      const tickets = await tx
        .select({ id: anmeldungTicketsTable.id, ticket_nummer: anmeldungTicketsTable.ticket_nummer })
        .from(anmeldungTicketsTable)
        .where(eq(anmeldungTicketsTable.anmeldung_id, id))
        .orderBy(anmeldungTicketsTable.ticket_nummer);

      for (let i = 0; i < tickets.length && i < neuPersonen.length; i++) {
        await tx
          .update(anmeldungTicketsTable)
          .set({ person_name: neuPersonen[i]! })
          .where(eq(anmeldungTicketsTable.id, tickets[i]!.id));
      }
    });

    res.json({ ok: true, personen: neuPersonen });
  } catch (err) {
    req.log.error(err, "admin personen-update failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// GET /api/admin/anmeldungen/:id/ticket-vorschau?format=png|pdf
// Renders a sample ticket for the given Anmeldung and returns PNG (inline) or PDF (download).
// Uses existing tickets if present; otherwise falls back to a dummy entry from personen names.
router.get("/admin/anmeldungen/:id/ticket-vorschau", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  const format = req.query["format"] === "pdf" ? "pdf" : "png";

  try {
    const anmeldungen = await db
      .select()
      .from(anmeldungenTable)
      .where(eq(anmeldungenTable.id, id))
      .limit(1);

    if (anmeldungen.length === 0) {
      res.status(404).json({ error: "Anmeldung nicht gefunden" });
      return;
    }
    const anmeldung = anmeldungen[0]!;

    // Try to use existing tickets; fall back to dummy data from person names
    const vorhandene = await db
      .select()
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.anmeldung_id, id));

    let tickets: { name: string; nummer: string; code: string }[];

    if (vorhandene.length > 0) {
      tickets = vorhandene.map(t => ({
        name:   t.person_name,
        nummer: t.ticket_nummer,
        code:   t.ticket_code,
      }));
    } else {
      const personenNames = parsePersonen(anmeldung.personen);
      if (personenNames.length === 0) {
        res.status(400).json({ error: "Keine Personennamen in der Anmeldung" });
        return;
      }
      tickets = personenNames.map((name, i) => ({
        name,
        nummer: String(i + 1),
        code:   "MUSTERTICKET",
      }));
    }

    const posterBuffer = (() => {
      const p = fileURLToPath(new URL("../assets/boomerpartyposter.jpeg", import.meta.url));
      return readFileSync(p);
    })();

    if (format === "png") {
      const first = tickets[0]!;
      const png = await renderTicketFrontPNG({ ...first, posterBuffer });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `inline; filename="ticket-vorschau-${id}.png"`);
      res.send(png);
    } else {
      const pdf = await generateTicketPDF(tickets, { posterBuffer });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="ticket-vorschau-${id}.pdf"`);
      res.send(pdf);
    }
  } catch (err) {
    req.log.error(err, "ticket-vorschau failed");
    res.status(500).json({ error: "Vorschau konnte nicht generiert werden." });
  }
});

// GET /api/admin/alle-tickets — alle generierten Tickets + Freitickets, sortiert nach Nummer/ID
router.get("/admin/alle-tickets", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const phase2 = await db
      .select({
        id:             anmeldungTicketsTable.id,
        anmeldung_id:   anmeldungTicketsTable.anmeldung_id,
        person_name:    anmeldungTicketsTable.person_name,
        ticket_nummer:  anmeldungTicketsTable.ticket_nummer,
        ticket_code:    anmeldungTicketsTable.ticket_code,
        versendet_am:   anmeldungTicketsTable.versendet_am,
        eingelassen_am: anmeldungTicketsTable.eingelassen_am,
        created_at:     anmeldungTicketsTable.created_at,
      })
      .from(anmeldungTicketsTable)
      .orderBy(sql`CASE WHEN ticket_nummer ~ '^[0-9]+$' THEN ticket_nummer::int ELSE 0 END ASC, id ASC`);

    const freitickets = await db
      .select({
        id:             legacyTicketsTable.id,
        anmeldung_id:   legacyTicketsTable.anmeldungId,
        person_name:    legacyTicketsTable.personName,
        ticket_nummer:  legacyTicketsTable.ticketCode,
        ticket_code:    legacyTicketsTable.ticketCode,
        versendet_am:   legacyTicketsTable.paidAt,
        eingelassen_am: legacyTicketsTable.usedAt,
        created_at:     legacyTicketsTable.createdAt,
      })
      .from(legacyTicketsTable)
      .where(isNull(legacyTicketsTable.anmeldungId));

    const result = [
      ...phase2.map(t => ({ ...t, is_freiticket: false })),
      ...freitickets.map(t => ({ ...t, is_freiticket: true })),
    ];
    res.json(result);
  } catch (err) {
    req.log.error(err, "alle-tickets failed");
    res.status(500).json({ error: "Fehler beim Laden der Tickets" });
  }
});

// GET /api/admin/einlass-monitor — live status of all tickets + scan log
router.get("/admin/einlass-monitor", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const allTickets = await db
      .select({
        id:             anmeldungTicketsTable.id,
        ticket_code:    anmeldungTicketsTable.ticket_code,
        ticket_nummer:  anmeldungTicketsTable.ticket_nummer,
        person_name:    anmeldungTicketsTable.person_name,
        eingelassen_am: anmeldungTicketsTable.eingelassen_am,
        anmeldung_id:   anmeldungTicketsTable.anmeldung_id,
      })
      .from(anmeldungTicketsTable)
      .orderBy(anmeldungTicketsTable.ticket_nummer);

    const logEntries = await db
      .select()
      .from(scanLog)
      .orderBy(desc(scanLog.scanned_at))
      .limit(100);

    const eingelassen = allTickets.filter(t => t.eingelassen_am !== null);
    const nicht_da    = allTickets.filter(t => t.eingelassen_am === null);

    res.json({
      tickets_total:    allTickets.length,
      eingelassen_count: eingelassen.length,
      eingelassen,
      nicht_da,
      scan_log: logEntries,
    });
  } catch (err) {
    req.log.error(err, "einlass-monitor failed");
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

export default router;
