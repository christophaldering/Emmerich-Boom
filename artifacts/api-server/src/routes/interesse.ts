import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { interessenten, anmeldungenTable } from "@workspace/db";
import { count, desc, isNotNull, ne, sql } from "drizzle-orm";
import { generateKaiComment } from "./stimmung";

const router = Router();

const interesSchema = z.object({
  name: z.string().min(1).max(100),
  personen: z.string(),
  statement: z.string().max(500).optional(),
  song: z.string().max(200).optional(),
  visitorId: z.string().max(64).optional(),
});

router.post("/interesse", async (req, res) => {
  const parsed = interesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Ungültige Eingabe" });
    return;
  }

  const existing = await db
    .select({ id: interessenten.id })
    .from(interessenten)
    .where(sql`lower(trim(${interessenten.name})) = lower(trim(${parsed.data.name}))`)
    .limit(1);

  if (existing.length > 0) {
    res.json({
      duplicate: true,
      message: `Ein „${parsed.data.name}" steht schon auf der Liste. Falls das jemand anderes ist, meld dich einfach mit einem Zusatz — z.B. „${parsed.data.name} aus Kleve" oder „${parsed.data.name} (Jahrgang 65)".`,
    });
    return;
  }

  const { visitorId, ...rest } = parsed.data;
  const inserted = await db
    .insert(interessenten)
    .values({ ...rest, visitorId: visitorId ?? null })
    .returning({ id: interessenten.id });
  res.json({ success: true, id: inserted[0]?.id ?? null });

  generateKaiComment().catch(() => {});
});

router.get("/interessenten/count", async (_req, res) => {
  const result = await db.select({ count: count() }).from(interessenten);
  res.json({ count: result[0]?.count ?? 0 });
});

router.get("/interesse", async (_req, res) => {
  const rows = await db
    .select({
      id: interessenten.id,
      name: interessenten.name,
      personen: interessenten.personen,
      statement: interessenten.statement,
      song: interessenten.song,
      createdAt: interessenten.createdAt,
    })
    .from(interessenten)
    .orderBy(desc(interessenten.createdAt));

  const anmeldungRows = await db
    .select({
      id: anmeldungenTable.id,
      email: anmeldungenTable.email,
      personen: anmeldungenTable.personen,
      song: anmeldungenTable.song,
      createdAt: anmeldungenTable.created_at,
    })
    .from(anmeldungenTable)
    .where(isNotNull(anmeldungenTable.song))
    .orderBy(desc(anmeldungenTable.created_at));

  const anmeldungWishes = anmeldungRows
    .filter((r) => r.song && r.song.trim() !== "")
    .map((r) => {
      const personen = r.personen as Array<{ name?: string }> | null;
      const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : r.email;
      return {
        id: `a${r.id}`,
        name: firstName,
        song: r.song,
        createdAt: r.createdAt,
      };
    });

  const allRows = [
    ...rows,
    ...anmeldungWishes,
  ].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  res.json(allRows);
});

export default router;
