import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { interessenten, anmeldungenTable, displayNamesTable } from "@workspace/db";
import { count, desc, eq, isNull, ne, sql } from "drizzle-orm";
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

const PERSONEN_COUNT: Record<string, number> = {
  "Nur ich": 1,
  "Wir zwei": 2,
  "Wir drei": 3,
  "Vier auf einen Streich": 4,
  "Fünf oder mehr": 5,
};

router.get("/interesse", async (_req, res) => {
  const [rows, anmeldungRows, approvedRows] = await Promise.all([
    db
      .select({
        id: interessenten.id,
        name: interessenten.name,
        personen: interessenten.personen,
        statement: interessenten.statement,
        song: interessenten.song,
        createdAt: interessenten.createdAt,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt)),
    db
      .select({
        id: anmeldungenTable.id,
        email: anmeldungenTable.email,
        personen: anmeldungenTable.personen,
        song: anmeldungenTable.song,
        createdAt: anmeldungenTable.created_at,
      })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am))
      .orderBy(desc(anmeldungenTable.created_at)),
    db
      .select({
        source_type: displayNamesTable.source_type,
        source_id: displayNamesTable.source_id,
        approved_name: displayNamesTable.approved_name,
      })
      .from(displayNamesTable)
      .where(eq(displayNamesTable.status, "approved")),
  ]);

  const approvedMap = new Map(
    approvedRows.map((r) => [`${r.source_type}:${r.source_id}`, r.approved_name]),
  );

  const phase1Boomer = rows.length;
  const phase1Personen = rows.reduce(
    (sum, r) => sum + (PERSONEN_COUNT[r.personen ?? ""] ?? 1),
    0,
  );

  const anmeldungWishes = anmeldungRows
    .map((r) => {
      const personen = r.personen as Array<{ name?: string }> | null;
      const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : r.email;
      return {
        id: `a${r.id}`,
        name: firstName,
        song: r.song,
        createdAt: r.createdAt,
        display_name: approvedMap.get(`anmeldung:${r.id}`) ?? null,
      };
    });

  const interesseWithDisplay = rows.map((r) => ({
    ...r,
    display_name: approvedMap.get(`interessent:${r.id}`) ?? null,
  }));

  const entries = [
    ...interesseWithDisplay,
    ...anmeldungWishes,
  ].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  res.json({
    stats: { boomer: phase1Boomer, personen: phase1Personen },
    entries,
  });
});

export default router;
