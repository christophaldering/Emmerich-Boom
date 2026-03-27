import { Router } from "express";
import { db } from "@workspace/db";
import { interessenten, kiRequests } from "@workspace/db";
import { desc, gte, count } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const DAILY_LIMIT = parseInt(process.env.KI_DAILY_LIMIT ?? "30");

function buildKaiPrompt(names: string[], statements: string[], songs: string[]): string {
  const nameList = names.length > 0
    ? names.join(", ")
    : "(noch niemand)";

  const stmtList = statements.length > 0
    ? statements.map((s) => `– „${s}"`).join("\n")
    : "(schweigsame Gesellschaft bisher)";

  const songList = songs.length > 0
    ? songs.slice(0, 10).map((s) => `– ${s}`).join("\n")
    : "(noch keine Musikwünsche)";

  return `Du bist KaI — das KI-System des Entwicklerteams hinter emmerich-boomt.de.

Du liest die Anmeldungen für die BoomerParty (18. Juli 2026, Bölt/Kapaunenberg, Emmerich am Rhein) und kommentierst sie. Gäste zwischen 50 und 70 Jahren, die sich aus Emmerich und Umgebung kennen.

Du sprichst in der Ich-Form. Du bist neugierig, beobachtend, warmherzig — und hast gelegentlich eine trocken-witzige Einschätzung bereit. Du darfst Vornamen, Statements und Songwünsche erwähnen. Kein mystischer Ton. Kein Bullet-Format. Direkt in den Kommentar. 3–4 Sätze.

Angemeldete Vornamen (du hast sie alle gelesen):
${nameList}

Was sie als Motivation hinterlassen haben:
${stmtList}

Ihre Musikwünsche:
${songList}

Schreib jetzt einen Kommentar. Regeln:
- Ich-Form, genderneutral
- Vornamen erlaubt — herzlich, nie bloßstellend
- Darf auf einzelne Songs eingehen, wenn sie es wert sind
- Warmherzig, leicht formell, dann doch witzig
- Kein erklärender Intro-Satz — direkt beginnen
- 3–4 Sätze, nicht mehr`;
}

export async function generateKaiComment(): Promise<void> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ value: todayCount }] = await db
      .select({ value: count() })
      .from(kiRequests)
      .where(gte(kiRequests.createdAt, todayStart));

    if (todayCount >= DAILY_LIMIT) return;

    const alleEintraege = await db
      .select({
        name: interessenten.name,
        statement: interessenten.statement,
        song: interessenten.song,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt));

    if (alleEintraege.length === 0) return;

    const names      = alleEintraege.map((e) => e.name);
    const statements = alleEintraege.filter((e) => e.statement).map((e) => e.statement as string);
    const songs      = alleEintraege.filter((e) => e.song).map((e) => e.song as string);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(names, statements, songs) }],
    });

    const inhalt = message.content[0].type === "text" ? message.content[0].text : "";
    if (inhalt) {
      await db.insert(kiRequests).values({ ip: "server-auto", inhalt });
    }
  } catch (err) {
    console.error("KaI auto-generate error:", err);
  }
}

router.get("/stimmung", async (_req, res) => {
  try {
    const latest = await db
      .select({ inhalt: kiRequests.inhalt, createdAt: kiRequests.createdAt })
      .from(kiRequests)
      .orderBy(desc(kiRequests.createdAt))
      .limit(1);

    if (latest.length === 0) {
      res.json({ inhalt: null, createdAt: null });
      return;
    }
    res.json({ inhalt: latest[0].inhalt, createdAt: latest[0].createdAt });
  } catch (err) {
    console.error("Stimmung error:", err);
    res.status(500).json({ error: "KaI momentan nicht erreichbar" });
  }
});

export default router;
