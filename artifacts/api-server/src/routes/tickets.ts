import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { db } from "@workspace/db";
import { tickets, interessenten, anmeldungTicketsTable, anmeldungenTable, scanLog } from "@workspace/db";
import { eq, desc, isNotNull, sql } from "drizzle-orm";
import crypto from "crypto";
import { renderTicketFrontPNG } from "../services/ticket-render.js";
import { generateTicketPDF } from "../services/pdf.js";

let _poster: Buffer | null = null;
function getPoster(): Buffer {
  if (!_poster) {
    const p = fileURLToPath(new URL("../assets/boomerpartyposter.jpeg", import.meta.url));
    _poster = readFileSync(p);
  }
  return _poster;
}

const router = Router();

function generateCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

// POST /api/admin/tickets/generate — generate tickets for a registration
const generateSchema = z.object({
  anmeldungId: z.number().int().positive(),
  paymentMethod: z.enum(["paypal", "ueberweisung", "bar"]),
  names: z.array(z.string().min(1)).min(1),
});

router.post("/admin/tickets/generate", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== "emmerich-orga-stats-2026") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe", details: parsed.error.flatten() });
    return;
  }

  const { anmeldungId, paymentMethod, names } = parsed.data;

  // Check if registration exists
  const anmeldung = await db
    .select({ id: interessenten.id })
    .from(interessenten)
    .where(eq(interessenten.id, anmeldungId))
    .limit(1);

  if (anmeldung.length === 0) {
    res.status(404).json({ error: "Anmeldung nicht gefunden" });
    return;
  }

  // Delete existing tickets for this registration first
  await db.delete(tickets).where(eq(tickets.anmeldungId, anmeldungId));

  // Create new tickets
  const now = new Date();
  const created = await db
    .insert(tickets)
    .values(
      names.map((name) => ({
        anmeldungId,
        personName: name,
        ticketCode: generateCode(),
        paymentMethod,
        paidAt: now,
      }))
    )
    .returning();

  res.json({ success: true, tickets: created });
});

// GET /api/admin/tickets — list all tickets with registration info
router.get("/admin/tickets", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== "emmerich-orga-stats-2026") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const rows = await db
    .select({
      id: tickets.id,
      anmeldungId: tickets.anmeldungId,
      personName: tickets.personName,
      ticketCode: tickets.ticketCode,
      paymentMethod: tickets.paymentMethod,
      paidAt: tickets.paidAt,
      usedAt: tickets.usedAt,
      createdAt: tickets.createdAt,
      registrationName: interessenten.name,
    })
    .from(tickets)
    .leftJoin(interessenten, eq(tickets.anmeldungId, interessenten.id))
    .orderBy(desc(tickets.createdAt));

  res.json(rows);
});

// GET /api/ticket/:code — get ticket info (for print view & scan check)
router.get("/ticket/:code", async (req, res) => {
  const code = req.params.code.toUpperCase();

  // Phase 2: check anmeldung_tickets first
  const p2 = await db
    .select({
      id: anmeldungTicketsTable.id,
      personName: anmeldungTicketsTable.person_name,
      ticketCode: anmeldungTicketsTable.ticket_code,
      usedAt: anmeldungTicketsTable.eingelassen_am,
      createdAt: anmeldungTicketsTable.created_at,
    })
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  if (p2.length > 0) {
    const t = p2[0]!;
    res.json({
      id: t.id,
      anmeldungId: null,
      personName: t.personName,
      ticketCode: t.ticketCode,
      paymentMethod: null,
      paidAt: null,
      usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
      registrationName: null,
    });
    return;
  }

  // Legacy: check tickets table
  const rows = await db
    .select({
      id: tickets.id,
      anmeldungId: tickets.anmeldungId,
      personName: tickets.personName,
      ticketCode: tickets.ticketCode,
      paymentMethod: tickets.paymentMethod,
      paidAt: tickets.paidAt,
      usedAt: tickets.usedAt,
      createdAt: tickets.createdAt,
      registrationName: interessenten.name,
    })
    .from(tickets)
    .leftJoin(interessenten, eq(tickets.anmeldungId, interessenten.id))
    .where(eq(tickets.ticketCode, code))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Ticket nicht gefunden" });
    return;
  }

  res.json(rows[0]);
});

// POST /api/ticket/:code/scan — mark ticket as used (entrance scan)
// Checks anmeldung_tickets (Phase 2) first, then legacy tickets table
router.post("/ticket/:code/scan", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== "emmerich-orga-stats-2026") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const code = req.params.code.toUpperCase();

  // ── Phase 2: anmeldung_tickets ──
  const phase2Rows = await db
    .select()
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  if (phase2Rows.length > 0) {
    const t = phase2Rows[0]!;
    if (t.eingelassen_am) {
      await db.insert(scanLog).values({ ticket_code: code, result: "already_used", person_name: t.person_name }).catch(() => {});
      res.json({
        status: "already_used",
        message: "Ticket bereits eingelöst",
        usedAt: t.eingelassen_am,
        personName: t.person_name,
      });
      return;
    }
    await db
      .update(anmeldungTicketsTable)
      .set({ eingelassen_am: new Date() })
      .where(eq(anmeldungTicketsTable.ticket_code, code));
    await db.insert(scanLog).values({ ticket_code: code, result: "ok", person_name: t.person_name }).catch(() => {});
    res.json({ status: "ok", message: "Willkommen!", personName: t.person_name });
    return;
  }

  // ── Legacy: tickets table ──
  const legacyRows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.ticketCode, code))
    .limit(1);

  if (legacyRows.length === 0) {
    await db.insert(scanLog).values({ ticket_code: code, result: "invalid", person_name: null }).catch(() => {});
    res.status(404).json({ status: "invalid", message: "Unbekannter Code" });
    return;
  }

  const ticket = legacyRows[0]!;
  if (ticket.usedAt) {
    await db.insert(scanLog).values({ ticket_code: code, result: "already_used", person_name: ticket.personName }).catch(() => {});
    res.json({
      status: "already_used",
      message: "Ticket bereits eingelöst",
      usedAt: ticket.usedAt,
      personName: ticket.personName,
    });
    return;
  }
  await db
    .update(tickets)
    .set({ usedAt: new Date() })
    .where(eq(tickets.ticketCode, code));
  await db.insert(scanLog).values({ ticket_code: code, result: "ok", person_name: ticket.personName }).catch(() => {});
  res.json({ status: "ok", message: "Willkommen!", personName: ticket.personName });
});

// GET /api/admin/eingelassen — list all checked-in tickets (Phase 2 + legacy)
router.get("/admin/eingelassen", async (req, res) => {
  const secret = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (secret !== "emmerich-orga-stats-2026") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const phase2 = await db
    .select({
      id: anmeldungTicketsTable.id,
      ticket_code: anmeldungTicketsTable.ticket_code,
      ticket_nummer: anmeldungTicketsTable.ticket_nummer,
      person_name: anmeldungTicketsTable.person_name,
      eingelassen_am: anmeldungTicketsTable.eingelassen_am,
    })
    .from(anmeldungTicketsTable)
    .where(isNotNull(anmeldungTicketsTable.eingelassen_am))
    .orderBy(desc(anmeldungTicketsTable.eingelassen_am));

  const legacy = await db
    .select({
      id: tickets.id,
      ticket_code: tickets.ticketCode,
      ticket_nummer: sql<string | null>`NULL`,
      person_name: tickets.personName,
      eingelassen_am: tickets.usedAt,
    })
    .from(tickets)
    .where(isNotNull(tickets.usedAt))
    .orderBy(desc(tickets.usedAt));

  const combined = [...phase2, ...legacy].sort((a, b) => {
    const ta = a.eingelassen_am?.getTime() ?? 0;
    const tb = b.eingelassen_am?.getTime() ?? 0;
    return tb - ta;
  });

  res.json(combined);
});

// GET /api/ticket/:code/download/png — public: renders ticket front as PNG
router.get("/ticket/:code/download/png", async (req, res) => {
  const code = req.params.code!.toUpperCase();

  // Phase 2
  const p2 = await db
    .select({ name: anmeldungTicketsTable.person_name, nummer: anmeldungTicketsTable.ticket_nummer, code: anmeldungTicketsTable.ticket_code })
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  let ticket: { name: string; nummer: string; code: string } | null = null;
  if (p2.length > 0) {
    ticket = p2[0]!;
  } else {
    const leg = await db
      .select({ name: tickets.personName, nummer: tickets.ticketCode, code: tickets.ticketCode })
      .from(tickets)
      .where(eq(tickets.ticketCode, code))
      .limit(1);
    if (leg.length > 0) ticket = leg[0]!;
  }

  if (!ticket) { res.status(404).json({ error: "Ticket nicht gefunden" }); return; }

  try {
    const png = await renderTicketFrontPNG({ ...ticket, posterBuffer: getPoster() });
    const safeName = ticket.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, "-");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="Ticket-${ticket.nummer}-${safeName}.png"`);
    res.send(png);
  } catch (err) {
    req.log.error(err, "ticket download png failed");
    res.status(500).json({ error: "Render fehlgeschlagen" });
  }
});

// GET /api/ticket/:code/download/pdf — public: renders combined PDF for all tickets in the same anmeldung
router.get("/ticket/:code/download/pdf", async (req, res) => {
  const code = req.params.code!.toUpperCase();

  let ticketList: { name: string; nummer: string; code: string }[] = [];

  // Phase 2
  const p2row = await db
    .select({ anmeldungId: anmeldungTicketsTable.anmeldung_id })
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  if (p2row.length > 0) {
    const rows = await db
      .select({ name: anmeldungTicketsTable.person_name, nummer: anmeldungTicketsTable.ticket_nummer, code: anmeldungTicketsTable.ticket_code })
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.anmeldung_id, p2row[0]!.anmeldungId));
    ticketList = rows;
  } else {
    const legRow = await db
      .select({ anmeldungId: tickets.anmeldungId, personName: tickets.personName, ticketCode: tickets.ticketCode })
      .from(tickets)
      .where(eq(tickets.ticketCode, code))
      .limit(1);

    const legAnmeldungId = legRow[0]?.anmeldungId;
    if (legAnmeldungId != null) {
      const rows = await db
        .select({ name: tickets.personName, nummer: tickets.ticketCode, code: tickets.ticketCode })
        .from(tickets)
        .where(eq(tickets.anmeldungId, legAnmeldungId));
      ticketList = rows;
    } else if (legRow.length > 0) {
      // Fallback: single ticket with no anmeldungId grouping
      ticketList = [{ name: legRow[0]!.personName, nummer: legRow[0]!.ticketCode, code: legRow[0]!.ticketCode }];
    }
  }

  if (ticketList.length === 0) { res.status(404).json({ error: "Ticket nicht gefunden" }); return; }

  try {
    const pdf = await generateTicketPDF(ticketList, { posterBuffer: getPoster() });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Tickets-EMMERICH-BOOMT.pdf"`);
    res.send(pdf);
  } catch (err) {
    req.log.error(err, "ticket download pdf failed");
    res.status(500).json({ error: "Render fehlgeschlagen" });
  }
});

// POST /api/ticket/:code/freischalten — reset check-in (admin only)
router.post("/ticket/:code/freischalten", async (req, res) => {
  const secret = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (secret !== "emmerich-orga-stats-2026") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const code = req.params.code.toUpperCase();

  // Phase 2
  const phase2Rows = await db
    .select()
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  if (phase2Rows.length > 0) {
    await db
      .update(anmeldungTicketsTable)
      .set({ eingelassen_am: null })
      .where(eq(anmeldungTicketsTable.ticket_code, code));
    res.json({ success: true, personName: phase2Rows[0]!.person_name });
    return;
  }

  // Legacy
  const legacyRows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.ticketCode, code))
    .limit(1);

  if (legacyRows.length === 0) {
    res.status(404).json({ error: "Ticket nicht gefunden" });
    return;
  }

  await db
    .update(tickets)
    .set({ usedAt: null })
    .where(eq(tickets.ticketCode, code));
  res.json({ success: true, personName: legacyRows[0]!.personName });
});

// GET /api/ticket/:code/overview — public: alle Tickets der gleichen Anmeldung
// Zugriff erfordert einen gültigen Ticket-Code (16-Hex, nicht erratbar).
// Gleiche Sicherheitslogik wie /ticket/:code/download/pdf.
router.get("/ticket/:code/overview", async (req, res) => {
  const code = req.params.code!.toUpperCase();

  // Phase 2: anmeldung_tickets
  const p2row = await db
    .select({ anmeldungId: anmeldungTicketsTable.anmeldung_id })
    .from(anmeldungTicketsTable)
    .where(eq(anmeldungTicketsTable.ticket_code, code))
    .limit(1);

  if (p2row.length > 0) {
    const anmeldungId = p2row[0]!.anmeldungId;
    const rows = await db
      .select({
        name:   anmeldungTicketsTable.person_name,
        nummer: anmeldungTicketsTable.ticket_nummer,
        code:   anmeldungTicketsTable.ticket_code,
        usedAt: anmeldungTicketsTable.eingelassen_am,
      })
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.anmeldung_id, anmeldungId))
      .orderBy(anmeldungTicketsTable.ticket_nummer);
    res.json({
      tickets: rows.map(t => ({
        name:   t.name,
        nummer: t.nummer,
        code:   t.code,
        usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      })),
    });
    return;
  }

  // Legacy: tickets table
  const legRow = await db
    .select({ anmeldungId: tickets.anmeldungId })
    .from(tickets)
    .where(eq(tickets.ticketCode, code))
    .limit(1);

  if (legRow.length === 0) {
    res.status(404).json({ error: "Ticket nicht gefunden" });
    return;
  }

  const legAnmeldungId = legRow[0]!.anmeldungId;
  if (legAnmeldungId != null) {
    const rows = await db
      .select({ name: tickets.personName, nummer: tickets.ticketCode, code: tickets.ticketCode, usedAt: tickets.usedAt })
      .from(tickets)
      .where(eq(tickets.anmeldungId, legAnmeldungId))
      .orderBy(tickets.createdAt);
    res.json({
      tickets: rows.map(t => ({
        name:   t.name,
        nummer: t.nummer,
        code:   t.code,
        usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      })),
    });
  } else {
    // Single legacy ticket with no anmeldungId grouping
    const single = await db
      .select({ name: tickets.personName, nummer: tickets.ticketCode, code: tickets.ticketCode, usedAt: tickets.usedAt })
      .from(tickets)
      .where(eq(tickets.ticketCode, code))
      .limit(1);
    res.json({
      tickets: single.map(t => ({
        name:   t.name,
        nummer: t.nummer,
        code:   t.code,
        usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      })),
    });
  }
});

export default router;
