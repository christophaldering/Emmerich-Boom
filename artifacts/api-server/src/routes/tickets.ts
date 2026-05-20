import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { tickets, interessenten, anmeldungTicketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

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
    res.status(404).json({ status: "invalid", message: "Unbekannter Code" });
    return;
  }

  const ticket = legacyRows[0]!;
  if (ticket.usedAt) {
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
  res.json({ status: "ok", message: "Willkommen!", personName: ticket.personName });
});

export default router;
