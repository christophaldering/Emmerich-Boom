import { Router, type Request, type Response } from "express";
import { db, scannerSlots, scanLog, anmeldungTicketsTable, anmeldungenTable, thekeProfileTable } from "@workspace/db";
import { eq, and, desc, isNotNull, gte, inArray } from "drizzle-orm";

const router = Router();
const SECRET = "emmerich-orga-stats-2026";

function requireAdmin(req: Request, res: Response): boolean {
  const s = req.headers["x-admin-secret"] ?? req.query["secret"];
  if (s !== SECRET) { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

// POST /api/einlass/auth — public: validates scanner credentials
router.post("/einlass/auth", async (req: Request, res: Response) => {
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name?.trim() || !password?.trim()) {
    res.status(400).json({ ok: false, message: "Name und Passwort erforderlich." });
    return;
  }
  const rows = await db
    .select()
    .from(scannerSlots)
    .where(eq(scannerSlots.active, true))
    .limit(100);

  const match = rows.find(
    r => r.name.toLowerCase().trim() === name.trim().toLowerCase() && r.password === password.trim()
  );

  if (!match) {
    res.status(401).json({ ok: false, message: "Unbekannter Scanner oder falsches Passwort." });
    return;
  }
  res.json({ ok: true, scanner_name: match.name });
});

// GET /api/admin/scanner-slots — list all slots
router.get("/admin/scanner-slots", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const rows = await db.select().from(scannerSlots).orderBy(scannerSlots.id);
  res.json(rows);
});

// POST /api/admin/scanner-slots — create a slot
router.post("/admin/scanner-slots", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name?.trim() || !password?.trim()) {
    res.status(400).json({ error: "Name und Passwort erforderlich." });
    return;
  }
  const [row] = await db.insert(scannerSlots).values({ name: name.trim(), password: password.trim() }).returning();
  res.json(row);
});

// PATCH /api/admin/scanner-slots/:id — update name/password/active
router.patch("/admin/scanner-slots/:id", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }
  const { name, password, active } = req.body as { name?: string; password?: string; active?: boolean };
  const update: Partial<{ name: string; password: string; active: boolean }> = {};
  if (name !== undefined)     update.name     = name.trim();
  if (password !== undefined) update.password = password.trim();
  if (active !== undefined)   update.active   = active;
  if (Object.keys(update).length === 0) { res.status(400).json({ error: "Nichts zu aktualisieren." }); return; }
  const [row] = await db.update(scannerSlots).set(update).where(eq(scannerSlots.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Nicht gefunden" }); return; }
  res.json(row);
});

// DELETE /api/admin/scanner-slots/:id
router.delete("/admin/scanner-slots/:id", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Ungültige ID" }); return; }
  await db.delete(scannerSlots).where(eq(scannerSlots.id, id));
  res.json({ ok: true });
});

// POST /api/admin/demo-tickets-anlegen — legt die 10 Demo-Tickets an, falls noch nicht vorhanden
const DEMO_PERSONEN = [
  { name: "Anna Bergmann",   code: "0DE0000000000001", nummer: "DEMO-01" },
  { name: "Klaus Hoffmann",  code: "0DE0000000000002", nummer: "DEMO-02" },
  { name: "Monika Schmidt",  code: "0DE0000000000003", nummer: "DEMO-03" },
  { name: "Werner Schulte",  code: "0DE0000000000004", nummer: "DEMO-04" },
  { name: "Ingrid Fischer",  code: "0DE0000000000005", nummer: "DEMO-05" },
  { name: "Günter Bauer",    code: "0DE0000000000006", nummer: "DEMO-06" },
  { name: "Hildegard Meyer", code: "0DE0000000000007", nummer: "DEMO-07" },
  { name: "Dieter Wagner",   code: "0DE0000000000008", nummer: "DEMO-08" },
  { name: "Ursula Koch",     code: "0DE0000000000009", nummer: "DEMO-09" },
  { name: "Helmut Schäfer",  code: "0DE0000000000010", nummer: "DEMO-10" },
] as const;

router.post("/admin/demo-tickets-anlegen", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const existing = await db
    .select({ code: anmeldungTicketsTable.ticket_code })
    .from(anmeldungTicketsTable)
    .where(inArray(anmeldungTicketsTable.ticket_code, DEMO_PERSONEN.map(d => d.code)));

  const existingCodes = new Set(existing.map(r => r.code));

  const angelegt: string[] = [];
  const uebersprungen: string[] = [];

  for (const demo of DEMO_PERSONEN) {
    if (existingCodes.has(demo.code)) {
      uebersprungen.push(demo.nummer);
      continue;
    }

    const [anmeldung] = await db.insert(anmeldungenTable).values({
      email:               `demo+${demo.nummer.toLowerCase()}@emmerich-boomt.de`,
      telefon:             null,
      personen_anzahl:     1,
      personen:            [{ name: demo.name }],
      bezahlweg:           "freiticket",
      song:                null,
      statement:           "Demo-Ticket (Testbetrieb)",
      betrag_gesamt:       0,
      ticket_nummern:      [demo.nummer],
      bezahlt_am:          new Date(),
    }).returning();

    if (!anmeldung) continue;

    await db.insert(anmeldungTicketsTable).values({
      anmeldung_id:  anmeldung.id,
      person_name:   demo.name,
      ticket_nummer: demo.nummer,
      ticket_code:   demo.code,
    });

    angelegt.push(demo.nummer);
  }

  res.json({ ok: true, angelegt, uebersprungen });
});

// POST /api/demo-reset — setzt die 10 Demo-Tickets zurück (Admin)
const DEMO_CODES = Array.from({ length: 10 }, (_, i) =>
  `0DE${String(i + 1).padStart(13, "0")}`.toUpperCase()
);

router.post("/demo-reset", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const [logResult, ticketResult] = await Promise.all([
    db.delete(scanLog)
      .where(inArray(scanLog.ticket_code, DEMO_CODES))
      .returning({ id: scanLog.id }),
    db.update(anmeldungTicketsTable)
      .set({ eingelassen_am: null })
      .where(inArray(anmeldungTicketsTable.ticket_code, DEMO_CODES))
      .returning({ name: anmeldungTicketsTable.person_name }),
  ]);

  res.json({
    ok: true,
    tickets_reset: ticketResult.length,
    logs_deleted:  logResult.length,
    namen:         ticketResult.map(t => t.name),
  });
});

// GET /api/tafel — öffentlich; Neuankömmlinge + Anwesende für den Einlass-Bildschirm
router.get("/tafel", async (_req: Request, res: Response) => {
  const cutoff = new Date(Date.now() - 90_000);

  const [neuankoemmlinge, anwesende] = await Promise.all([
    db
      .select({
        id:          scanLog.id,
        person_name: scanLog.person_name,
        scanned_at:  scanLog.scanned_at,
        lauter_song: thekeProfileTable.lauter_song,
      })
      .from(scanLog)
      .leftJoin(anmeldungTicketsTable, eq(anmeldungTicketsTable.ticket_code, scanLog.ticket_code))
      .leftJoin(thekeProfileTable, eq(thekeProfileTable.anmeldung_ticket_id, anmeldungTicketsTable.id))
      .where(and(eq(scanLog.result, "ok"), gte(scanLog.scanned_at, cutoff)))
      .orderBy(desc(scanLog.scanned_at))
      .limit(10),

    db
      .select({
        person_name:    anmeldungTicketsTable.person_name,
        eingelassen_am: anmeldungTicketsTable.eingelassen_am,
      })
      .from(anmeldungTicketsTable)
      .innerJoin(thekeProfileTable, eq(thekeProfileTable.anmeldung_ticket_id, anmeldungTicketsTable.id))
      .where(and(
        isNotNull(anmeldungTicketsTable.eingelassen_am),
        eq(thekeProfileTable.tafel_ok, true),
      ))
      .orderBy(anmeldungTicketsTable.eingelassen_am),
  ]);

  res.json({ neuankoemmlinge, anwesende, server_time: new Date().toISOString() });
});

export default router;
