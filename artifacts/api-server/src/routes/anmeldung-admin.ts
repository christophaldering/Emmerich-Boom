import { Router } from "express";
import { db, anmeldungenTable, anmeldungTicketsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import crypto from "crypto";
import { sendTicketMail } from "../services/mailer";

const router = Router();
const SECRET = "emmerich-orga-stats-2026";

function requireAdmin(req: any, res: any): boolean {
  if (req.headers["x-admin-secret"] !== SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

function generateCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function ticketNummer(anmeldungId: number, index: number): string {
  return `EB-${String(anmeldungId).padStart(3, "0")}-${index}`;
}

// GET /api/admin/anmeldungen — alle Phase-2-Anmeldungen mit Ticket-Zähler
router.get("/admin/anmeldungen", async (req, res) => {
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
        created_at:           anmeldungenTable.created_at,
        ticket_count:         sql<number>`(
          SELECT COUNT(*) FROM anmeldung_tickets
          WHERE anmeldung_tickets.anmeldung_id = ${anmeldungenTable.id}
        )`,
      })
      .from(anmeldungenTable)
      .orderBy(anmeldungenTable.created_at);

    res.json(rows);
  } catch (err) {
    req.log.error(err, "admin/anmeldungen list failed");
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// POST /api/admin/anmeldungen/:id/bezahlt — Bezahlung bestätigen
router.post("/admin/anmeldungen/:id/bezahlt", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
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

// POST /api/admin/anmeldungen/:id/tickets-versenden
// Generiert Tickets (falls noch nicht vorhanden) und sendet Mail
router.post("/admin/anmeldungen/:id/tickets-versenden", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }

  try {
    // Anmeldung laden
    const anmeldungen = await db
      .select()
      .from(anmeldungenTable)
      .where(eq(anmeldungenTable.id, id))
      .limit(1);

    if (anmeldungen.length === 0) { res.status(404).json({ error: "Anmeldung nicht gefunden" }); return; }
    const anmeldung = anmeldungen[0]!;

    if (!anmeldung.bezahlt_am) {
      res.status(400).json({ error: "Anmeldung noch nicht als bezahlt markiert" });
      return;
    }

    const personenNames = anmeldung.personen as string[];

    // Tickets laden (oder neu erzeugen)
    let vorhandene = await db
      .select()
      .from(anmeldungTicketsTable)
      .where(eq(anmeldungTicketsTable.anmeldung_id, id));

    if (vorhandene.length === 0) {
      // Neue Tickets generieren
      const values = personenNames.map((name, i) => ({
        anmeldung_id:   id,
        person_name:    name,
        ticket_nummer:  ticketNummer(id, i + 1),
        ticket_code:    generateCode(),
      }));
      vorhandene = await db
        .insert(anmeldungTicketsTable)
        .values(values)
        .returning();
    }

    // Mail versenden
    await sendTicketMail({
      to:        anmeldung.email,
      personen:  personenNames,
      tickets:   vorhandene.map(t => ({
        nummer:  t.ticket_nummer,
        code:    t.ticket_code,
        name:    t.person_name,
      })),
      bezahlweg: anmeldung.bezahlweg,
      betrag:    anmeldung.betrag_gesamt,
    });

    // ticket_versendet_am setzen
    await db
      .update(anmeldungenTable)
      .set({ ticket_versendet_am: new Date() })
      .where(eq(anmeldungenTable.id, id));

    // versendet_am pro Ticket setzen
    await db
      .update(anmeldungTicketsTable)
      .set({ versendet_am: new Date() })
      .where(eq(anmeldungTicketsTable.anmeldung_id, id));

    res.json({ ok: true, tickets_count: vorhandene.length });
  } catch (err) {
    req.log.error(err, "tickets-versenden failed");
    res.status(500).json({ error: "Versand fehlgeschlagen: " + String(err) });
  }
});

export default router;
