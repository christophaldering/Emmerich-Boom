import { Router, type Request, type Response } from "express";
import { db, interessenten, anmeldungenTable } from "@workspace/db";
import { displayNamesTable } from "@workspace/db";
import { eq, and, isNotNull, ne, sql } from "drizzle-orm";

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

export function suggestName(raw: string): string {
  let s = raw.trim();
  if (s.includes("@")) {
    s = s.split("@")[0]!;
  }
  s = s.replace(/\d+$/, "");
  const parts = s.split(/[.\-_\s]+/).filter(Boolean);
  const first = parts[0] ?? s;
  if (!first) return "Gast";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

router.post("/admin/display-names/sync", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  try {
    const [interessentRows, anmeldungRows] = await Promise.all([
      db
        .select({ id: interessenten.id, name: interessenten.name, song: interessenten.song })
        .from(interessenten)
        .where(and(isNotNull(interessenten.song), ne(interessenten.song, ""))),
      db
        .select({ id: anmeldungenTable.id, email: anmeldungenTable.email, personen: anmeldungenTable.personen, song: anmeldungenTable.song })
        .from(anmeldungenTable)
        .where(and(isNotNull(anmeldungenTable.song), ne(anmeldungenTable.song, ""))),
    ]);

    const existing = await db
      .select({ source_type: displayNamesTable.source_type, source_id: displayNamesTable.source_id })
      .from(displayNamesTable);
    const existingSet = new Set(existing.map((e) => `${e.source_type}:${e.source_id}`));

    const toInsert: typeof displayNamesTable.$inferInsert[] = [];

    for (const r of interessentRows) {
      const key = `interessent:${r.id}`;
      if (!existingSet.has(key) && r.song) {
        toInsert.push({
          source_type: "interessent",
          source_id: String(r.id),
          raw_name: r.name,
          song: r.song,
          suggested_name: suggestName(r.name),
          status: "pending",
        });
      }
    }

    for (const r of anmeldungRows) {
      const key = `anmeldung:${r.id}`;
      if (!existingSet.has(key) && r.song) {
        const personen = r.personen as Array<{ name?: string }> | null;
        const displayRaw = Array.isArray(personen) && personen[0]?.name ? personen[0].name : r.email;
        toInsert.push({
          source_type: "anmeldung",
          source_id: String(r.id),
          raw_name: displayRaw,
          song: r.song,
          suggested_name: suggestName(displayRaw),
          status: "pending",
        });
      }
    }

    if (toInsert.length > 0) {
      await db.insert(displayNamesTable).values(toInsert).onConflictDoNothing();
    }

    res.json({ synced: toInsert.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/admin/display-names", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  try {
    const rows = await db
      .select()
      .from(displayNamesTable)
      .orderBy(
        sql`CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`,
        displayNamesTable.source_type,
        displayNamesTable.id,
      );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/admin/display-names/:id", async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status, approved_name } = req.body as {
    status?: "pending" | "approved" | "rejected";
    approved_name?: string;
  };

  try {
    const updates: Partial<typeof displayNamesTable.$inferInsert> = {
      updated_at: new Date(),
    };
    if (status) updates.status = status;
    if (approved_name !== undefined) updates.approved_name = approved_name || null;

    await db
      .update(displayNamesTable)
      .set(updates)
      .where(eq(displayNamesTable.id, id));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
