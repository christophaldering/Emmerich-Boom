import { Router, type Request, type Response } from "express";
import { db, anmeldungenTable, anmeldungTicketsTable, thekeProfileTable, thekeBotschaftenTable, thekeFotosTable, thekeEinladungenTable } from "@workspace/db";
import { eq, desc, isNull, sql } from "drizzle-orm";
import { sendThekeEinladung } from "../services/mailer.js";

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

// GET /api/theke-admin/uebersicht  — per-ticket profile overview
router.get("/theke-admin/uebersicht", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const tickets = await db
      .select({
        id:            anmeldungTicketsTable.id,
        anmeldung_id:  anmeldungTicketsTable.anmeldung_id,
        person_name:   anmeldungTicketsTable.person_name,
        ticket_nummer: anmeldungTicketsTable.ticket_nummer,
        ticket_code:   anmeldungTicketsTable.ticket_code,
        created_at:    anmeldungTicketsTable.created_at,
      })
      .from(anmeldungTicketsTable)
      .orderBy(anmeldungTicketsTable.id);

    const profiles = await db
      .select()
      .from(thekeProfileTable);

    const botschaften = await db
      .select({ anmeldung_ticket_id: thekeBotschaftenTable.anmeldung_ticket_id })
      .from(thekeBotschaftenTable);

    const galerien = await db
      .select({
        anmeldung_ticket_id: thekeFotosTable.anmeldung_ticket_id,
      })
      .from(thekeFotosTable);

    const profileMap = new Map(profiles.map(p => [p.anmeldung_ticket_id, p]));
    const botschaftSet = new Set(botschaften.map(b => b.anmeldung_ticket_id));

    const galerieCount = new Map<number, number>();
    for (const g of galerien) {
      galerieCount.set(g.anmeldung_ticket_id, (galerieCount.get(g.anmeldung_ticket_id) ?? 0) + 1);
    }

    const result = tickets.map(t => {
      const p = profileMap.get(t.id);
      return {
        id:                          t.id,
        ticket_nummer:               t.ticket_nummer,
        person_name:                 t.person_name,
        anzeige_name:                p?.anzeige_name ?? t.person_name,
        bestaetigt:                  p?.bestaetigt ?? false,
        sichtbarkeit_zugestimmt_am:  p?.sichtbarkeit_zugestimmt_am ?? null,
        abendfotos_ok:               p?.abendfotos_ok ?? false,
        foto_frueher_key:            p?.foto_frueher_key ?? null,
        foto_heute_key:              p?.foto_heute_key ?? null,
        hat_botschaft:               botschaftSet.has(t.id),
        galerie_count:               galerieCount.get(t.id) ?? 0,
        created_at:                  t.created_at,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error(err, "theke-admin/uebersicht failed");
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// GET /api/theke-admin/einladungen  — per-ticket invitation targets (email from parent anmeldung)
router.get("/theke-admin/einladungen", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const tickets = await db
      .select({
        id:            anmeldungTicketsTable.id,
        anmeldung_id:  anmeldungTicketsTable.anmeldung_id,
        person_name:   anmeldungTicketsTable.person_name,
        ticket_nummer: anmeldungTicketsTable.ticket_nummer,
        ticket_code:   anmeldungTicketsTable.ticket_code,
      })
      .from(anmeldungTicketsTable)
      .orderBy(anmeldungTicketsTable.id);

    const anmeldungen = await db
      .select({ id: anmeldungenTable.id, email: anmeldungenTable.email })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am));

    const einladungen = await db
      .select({
        ticket_codes: thekeEinladungenTable.ticket_codes,
        versendet_am: thekeEinladungenTable.versendet_am,
      })
      .from(thekeEinladungenTable)
      .orderBy(desc(thekeEinladungenTable.versendet_am));

    const emailMap = new Map(anmeldungen.map(a => [a.id, a.email]));
    const anmeldungSet = new Set(anmeldungen.map(a => a.id));

    // Build a map: ticket_code -> latest versendet_am
    const latestByCode = new Map<string, Date>();
    for (const e of einladungen) {
      const codes = Array.isArray(e.ticket_codes) ? (e.ticket_codes as string[]) : [];
      for (const code of codes) {
        if (!latestByCode.has(code)) {
          latestByCode.set(code, e.versendet_am ?? new Date(0));
        }
      }
    }

    const result = tickets
      .filter(t => anmeldungSet.has(t.anmeldung_id))
      .map(t => ({
        id:                     t.id,
        ticket_nummer:          t.ticket_nummer,
        person_name:            t.person_name,
        email:                  emailMap.get(t.anmeldung_id) ?? "",
        einladung_versendet_am: latestByCode.get(t.ticket_code)?.toISOString() ?? null,
      }));

    res.json(result);
  } catch (err) {
    req.log.error(err, "theke-admin/einladungen failed");
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// POST /api/theke-admin/einladung/senden — per-ticket invitation (or per-anmeldung)
// Body: { ticket_id: number } — sends the magic link for one ticket
router.post("/theke-admin/einladung/senden", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body as { ticket_id?: number; anmeldung_ids?: number[]; alle?: boolean };

  try {
    if (body.ticket_id) {
      const [ticket] = await db
        .select()
        .from(anmeldungTicketsTable)
        .where(eq(anmeldungTicketsTable.id, body.ticket_id))
        .limit(1);

      if (!ticket) { res.status(404).json({ error: "Ticket nicht gefunden" }); return; }

      const [anmeldung] = await db
        .select({ email: anmeldungenTable.email })
        .from(anmeldungenTable)
        .where(eq(anmeldungenTable.id, ticket.anmeldung_id))
        .limit(1);

      if (!anmeldung) { res.status(404).json({ error: "Anmeldung nicht gefunden" }); return; }

      let status = "ok";
      let fehler_text: string | null = null;
      try {
        await sendThekeEinladung({
          to: anmeldung.email,
          tickets: [{ name: ticket.person_name, code: ticket.ticket_code }],
        });
      } catch (err) {
        status = "fehler";
        fehler_text = String(err);
      }

      await db.insert(thekeEinladungenTable).values({
        anmeldung_id:     ticket.anmeldung_id,
        empfaenger_email: anmeldung.email,
        anzahl_tickets:   1,
        ticket_codes:     [ticket.ticket_code],
        typ:              "einzeln",
        status,
        fehler_text,
        versendet_am:     new Date(),
      });

      res.json({ ok: status === "ok", ticket_id: ticket.id });
      return;
    }

    // legacy: send per anmeldung
    let anmeldungenToSend: { id: number; email: string }[] = [];
    if (body.alle) {
      anmeldungenToSend = await db
        .select({ id: anmeldungenTable.id, email: anmeldungenTable.email })
        .from(anmeldungenTable)
        .where(isNull(anmeldungenTable.storniert_am));
    } else if (Array.isArray(body.anmeldung_ids) && body.anmeldung_ids.length > 0) {
      anmeldungenToSend = await db
        .select({ id: anmeldungenTable.id, email: anmeldungenTable.email })
        .from(anmeldungenTable)
        .where(sql`${anmeldungenTable.id} = ANY(ARRAY[${sql.raw(body.anmeldung_ids.map(Number).join(","))}]::int[])`);
    } else {
      res.status(400).json({ error: "Keine Angaben" });
      return;
    }

    const results: { id: number; status: string }[] = [];
    for (const a of anmeldungenToSend) {
      const tickets = await db
        .select()
        .from(anmeldungTicketsTable)
        .where(eq(anmeldungTicketsTable.anmeldung_id, a.id));
      if (tickets.length === 0) { results.push({ id: a.id, status: "fehler" }); continue; }
      let status = "ok";
      try {
        await sendThekeEinladung({
          to: a.email,
          tickets: tickets.map(t => ({ name: t.person_name, code: t.ticket_code })),
        });
      } catch { status = "fehler"; }
      await db.insert(thekeEinladungenTable).values({
        anmeldung_id: a.id, empfaenger_email: a.email,
        anzahl_tickets: tickets.length, ticket_codes: tickets.map(t => t.ticket_code),
        typ: "gesamt", status, versendet_am: new Date(),
      });
      results.push({ id: a.id, status });
    }
    res.json({ ok: true, gesendet: results.filter(r => r.status === "ok").length });
  } catch (err) {
    req.log.error(err, "theke-admin/einladung/senden failed");
    res.status(500).json({ error: "Versand fehlgeschlagen" });
  }
});

export default router;
