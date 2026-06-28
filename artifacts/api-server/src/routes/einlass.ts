import { Router, type Request, type Response } from "express";
import { db, scannerSlots } from "@workspace/db";
import { eq } from "drizzle-orm";

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

export default router;
