import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { interessenten } from "@workspace/db";

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
  await db.insert(interessenten).values(parsed.data);
  res.json({ success: true });
});

export default router;
