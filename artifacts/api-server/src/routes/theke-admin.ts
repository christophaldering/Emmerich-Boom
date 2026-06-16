import { Router, type Request, type Response } from "express";
import { db, anmeldungenTable, anmeldungTicketsTable, thekeProfileTable, thekeBotschaftenTable, thekeFotosTable, thekeEinladungenTable } from "@workspace/db";
import { eq, ne, desc, isNull, sql } from "drizzle-orm";
import { sendThekeEinladung } from "../services/mailer.js";
import { SERVER_CONFIG } from "../config.js";

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

// ─── GET /api/theke-admin/uebersicht — per-ticket profile overview ─────────────
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
      .where(ne(anmeldungTicketsTable.ticket_code, SERVER_CONFIG.THEKE_DEMO_CODE))
      .orderBy(anmeldungTicketsTable.id);

    const profiles = await db.select().from(thekeProfileTable);

    const botschaften = await db
      .select({ anmeldung_ticket_id: thekeBotschaftenTable.anmeldung_ticket_id })
      .from(thekeBotschaftenTable);

    const galerien = await db
      .select({ anmeldung_ticket_id: thekeFotosTable.anmeldung_ticket_id })
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
        ticket_code:                 t.ticket_code,
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

    res.json({ demo_code: SERVER_CONFIG.THEKE_DEMO_CODE, tickets: result });
  } catch (err) {
    req.log.error(err, "theke-admin/uebersicht failed");
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// ─── GET /api/theke-admin/einladungen — per-ticket with full invitation protocol ──
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
      .where(ne(anmeldungTicketsTable.ticket_code, SERVER_CONFIG.THEKE_DEMO_CODE))
      .orderBy(anmeldungTicketsTable.id);

    const anmeldungen = await db
      .select({ id: anmeldungenTable.id, email: anmeldungenTable.email })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am));

    const alleEinladungen = await db
      .select({
        id:               thekeEinladungenTable.id,
        ticket_codes:     thekeEinladungenTable.ticket_codes,
        versendet_am:     thekeEinladungenTable.versendet_am,
        typ:              thekeEinladungenTable.typ,
        status:           thekeEinladungenTable.status,
        fehler_text:      thekeEinladungenTable.fehler_text,
        empfaenger_email: thekeEinladungenTable.empfaenger_email,
        anzahl_tickets:   thekeEinladungenTable.anzahl_tickets,
      })
      .from(thekeEinladungenTable)
      .orderBy(desc(thekeEinladungenTable.versendet_am));

    const emailMap = new Map(anmeldungen.map(a => [a.id, a.email]));
    const anmeldungSet = new Set(anmeldungen.map(a => a.id));

    // Map einladungen rows to ticket codes
    // One einladung row may contain multiple ticket codes (bulk send)
    const einladungenByCode = new Map<string, typeof alleEinladungen>();
    for (const e of alleEinladungen) {
      const codes = Array.isArray(e.ticket_codes) ? (e.ticket_codes as string[]) : [];
      for (const code of codes) {
        const list = einladungenByCode.get(code) ?? [];
        list.push(e);
        einladungenByCode.set(code, list);
      }
    }

    const result = tickets
      .filter(t => anmeldungSet.has(t.anmeldung_id))
      .map(t => {
        const versendungen = (einladungenByCode.get(t.ticket_code) ?? []).map(e => ({
          id:               e.id,
          versendet_am:     e.versendet_am?.toISOString() ?? null,
          typ:              e.typ,
          status:           e.status,
          fehler_text:      e.fehler_text ?? null,
          empfaenger_email: e.empfaenger_email,
          anzahl_tickets:   e.anzahl_tickets,
        }));
        const letzteVersendung = versendungen[0] ?? null;
        return {
          id:                     t.id,
          ticket_nummer:          t.ticket_nummer,
          person_name:            t.person_name,
          email:                  emailMap.get(t.anmeldung_id) ?? "",
          einladung_versendet_am: letzteVersendung?.versendet_am ?? null,
          versendungen_gesamt:    versendungen.length,
          letzter_status:         letzteVersendung?.status ?? null,
          versendungen,
        };
      });

    res.json(result);
  } catch (err) {
    req.log.error(err, "theke-admin/einladungen failed");
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// ─── POST /api/theke-admin/einladung/senden ────────────────────────────────────
// Body variants:
//   { ticket_id: number }              — single ticket
//   { ticket_ids: number[] }           — selected tickets (checkbox bulk)
//   { alle: true }                     — all tickets
//   { nur_nicht_eingeladene: true }    — only tickets never invited yet
router.post("/theke-admin/einladung/senden", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body as {
    ticket_id?: number;
    ticket_ids?: number[];
    alle?: boolean;
    nur_nicht_eingeladene?: boolean;
  };

  try {
    // Resolve which tickets to send to
    let ticketsToSend: { id: number; anmeldung_id: number; person_name: string; ticket_code: string }[] = [];

    if (body.ticket_id) {
      const [t] = await db
        .select()
        .from(anmeldungTicketsTable)
        .where(eq(anmeldungTicketsTable.id, body.ticket_id))
        .limit(1);
      if (!t) { res.status(404).json({ error: "Ticket nicht gefunden" }); return; }
      if (t.ticket_code === SERVER_CONFIG.THEKE_DEMO_CODE) {
        res.status(400).json({ error: "Demo-Ticket wird nie eingeladen" });
        return;
      }
      ticketsToSend = [t];

    } else if (Array.isArray(body.ticket_ids) && body.ticket_ids.length > 0) {
      const fetched = await db
        .select()
        .from(anmeldungTicketsTable)
        .where(sql`${anmeldungTicketsTable.id} = ANY(ARRAY[${sql.raw(body.ticket_ids.map(Number).join(","))}]::int[])`);
      ticketsToSend = fetched.filter(t => t.ticket_code !== SERVER_CONFIG.THEKE_DEMO_CODE);

    } else if (body.alle || body.nur_nicht_eingeladene) {
      const allTickets = await db
        .select({
          id:           anmeldungTicketsTable.id,
          anmeldung_id: anmeldungTicketsTable.anmeldung_id,
          person_name:  anmeldungTicketsTable.person_name,
          ticket_code:  anmeldungTicketsTable.ticket_code,
        })
        .from(anmeldungTicketsTable)
        // only tickets from non-cancelled anmeldungen, never the demo ticket
        .where(sql`${anmeldungTicketsTable.anmeldung_id} IN (
          SELECT id FROM ${anmeldungenTable} WHERE storniert_am IS NULL
        ) AND ${anmeldungTicketsTable.ticket_code} <> ${SERVER_CONFIG.THEKE_DEMO_CODE}`);

      if (body.nur_nicht_eingeladene) {
        const bereitsEingeladen = await db
          .select({ ticket_codes: thekeEinladungenTable.ticket_codes })
          .from(thekeEinladungenTable);
        const eingeladeneCodesSet = new Set<string>();
        for (const e of bereitsEingeladen) {
          const codes = Array.isArray(e.ticket_codes) ? (e.ticket_codes as string[]) : [];
          for (const c of codes) eingeladeneCodesSet.add(c);
        }
        ticketsToSend = allTickets.filter(t => !eingeladeneCodesSet.has(t.ticket_code));
      } else {
        ticketsToSend = allTickets;
      }

    } else {
      res.status(400).json({ error: "Keine Angaben" });
      return;
    }

    if (ticketsToSend.length === 0) {
      res.json({ ok: true, gesendet: 0, fehler: 0, details: [] });
      return;
    }

    // Get emails for all involved anmeldungen
    const anmeldungIds = [...new Set(ticketsToSend.map(t => t.anmeldung_id))];
    const anmeldungen = await db
      .select({ id: anmeldungenTable.id, email: anmeldungenTable.email })
      .from(anmeldungenTable)
      .where(sql`${anmeldungenTable.id} = ANY(ARRAY[${sql.raw(anmeldungIds.join(","))}]::int[])`);
    const emailMap = new Map(anmeldungen.map(a => [a.id, a.email]));

    // Group tickets by anmeldung (one email send per anmeldung for bulk, one per ticket for single)
    const isSingle = !!(body.ticket_id);
    const results: { ticket_id: number; status: string; fehler?: string }[] = [];

    if (isSingle) {
      // Single-ticket send
      const t = ticketsToSend[0]!;
      const email = emailMap.get(t.anmeldung_id) ?? "";
      let status = "ok";
      let fehler_text: string | null = null;
      try {
        await sendThekeEinladung({ to: email, tickets: [{ name: t.person_name, code: t.ticket_code }] });
      } catch (err) { status = "fehler"; fehler_text = String(err); }
      await db.insert(thekeEinladungenTable).values({
        anmeldung_id: t.anmeldung_id, empfaenger_email: email,
        anzahl_tickets: 1, ticket_codes: [t.ticket_code],
        typ: "einzeln", status, fehler_text, versendet_am: new Date(),
      });
      results.push({ ticket_id: t.id, status, fehler: fehler_text ?? undefined });

    } else {
      // Group by anmeldung → one email per anmeldung with all selected tickets
      const byAnmeldung = new Map<number, typeof ticketsToSend>();
      for (const t of ticketsToSend) {
        const list = byAnmeldung.get(t.anmeldung_id) ?? [];
        list.push(t);
        byAnmeldung.set(t.anmeldung_id, list);
      }
      for (const [anmeldung_id, aTickets] of byAnmeldung) {
        const email = emailMap.get(anmeldung_id) ?? "";
        let status = "ok";
        let fehler_text: string | null = null;
        try {
          await sendThekeEinladung({ to: email, tickets: aTickets.map(t => ({ name: t.person_name, code: t.ticket_code })) });
        } catch (err) { status = "fehler"; fehler_text = String(err); }
        await db.insert(thekeEinladungenTable).values({
          anmeldung_id, empfaenger_email: email,
          anzahl_tickets: aTickets.length, ticket_codes: aTickets.map(t => t.ticket_code),
          typ: body.alle ? "alle" : body.nur_nicht_eingeladene ? "nur_nicht_eingeladene" : "ausgewaehlt",
          status, fehler_text, versendet_am: new Date(),
        });
        for (const t of aTickets) results.push({ ticket_id: t.id, status, fehler: fehler_text ?? undefined });
      }
    }

    const gesendet = results.filter(r => r.status === "ok").length;
    const fehler = results.filter(r => r.status !== "ok").length;
    res.json({ ok: true, gesendet, fehler, details: results });

  } catch (err) {
    req.log.error(err, "theke-admin/einladung/senden failed");
    res.status(500).json({ error: "Versand fehlgeschlagen" });
  }
});

export default router;
