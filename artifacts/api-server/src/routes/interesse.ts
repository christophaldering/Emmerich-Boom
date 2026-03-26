import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { interessenten } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router = Router();

const interesSchema = z.object({
  name: z.string().min(1).max(100),
  personen: z.string(),
  statement: z.string().max(500).optional(),
  song: z.string().max(200).optional(),
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

  await db.insert(interessenten).values(parsed.data);
  res.json({ success: true });
});

router.get("/interesse", async (_req, res) => {
  const rows = await db
    .select({
      id: interessenten.id,
      name: interessenten.name,
      personen: interessenten.personen,
      song: interessenten.song,
      createdAt: interessenten.createdAt,
    })
    .from(interessenten)
    .orderBy(desc(interessenten.createdAt));
  res.json(rows);
});

export default router;
