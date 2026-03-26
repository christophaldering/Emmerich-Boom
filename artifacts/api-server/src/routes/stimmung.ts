import { Router } from "express";
import { db } from "@workspace/db";
import { interessenten, kiRequests } from "@workspace/db";
import { desc, gte, and, eq, count } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const RATE_LIMIT_MINUTES = 10;
const DAILY_LIMIT = parseInt(process.env.KI_DAILY_LIMIT ?? "30");

function getIp(req: Parameters<Parameters<ReturnType<typeof Router>["get"]>[1]>[0]): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

function buildPrompt(statements: string[], names: string[], songs: string[]): string {
  const stmtList = statements.length > 0
    ? statements.map((s, i) => `- ${names[i] ?? "Jemand"}: "${s}"`).join("\n")
    : "(Noch keine Statements eingegangen)";

  const songList = songs.length > 0
    ? songs.map((s) => `- ${s}`).join("\n")
    : "(Noch keine Songs)";

  return `Du bist ein witziger, warmherziger Partyanalyst mit einer Schwäche für nostalgische Boomer-Kultur.

Es geht um eine Party in Emmerich am Rhein am 18. Juli 2026 — die "BoomerParty" auf dem Bölt (Kapaunenberg). Die Eingeladenen sind zwischen 50 und 70 Jahre alt, kennen sich aus der Stadt und freuen sich auf 70er/80er-Musik.

Hier sind ihre Statements, warum sie dabei sind:
${stmtList}

Und das sind ihre Wunschsongs:
${songList}

Schreibe jetzt eine kurze, amüsante "KI-Analyse" der Gruppe — ca. 4-6 Sätze. Darin:
1. Eine witzige Charakterisierung der Gruppe anhand ihrer Statements
2. Eine humorvolle Ableitung daraus, welche Art Abend das wohl wird
3. Einen Kommentar zur Songliste — was sagt sie über die Gruppe aus?
4. Einen flotten Abschluss-Satz mit Vorfreude-Garantie

Schreib auf Deutsch. Locker, herzlich, mit einem Augenzwinkern. Kein Bullet-Format — fließender Text. Jede Analyse darf sich leicht von anderen unterscheiden — bring ruhig etwas Variation rein.`;
}

router.get("/stimmung", async (req, res) => {
  try {
    const ip = getIp(req);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ value: todayCount }] = await db
      .select({ value: count() })
      .from(kiRequests)
      .where(gte(kiRequests.createdAt, todayStart));

    if (todayCount >= DAILY_LIMIT) {
      res.json({
        status: "daily_limit",
        message: "Die KI hat ihr Tageskontingent erreicht. Morgen wieder!",
        inhalt: null,
      });
      return;
    }

    const rateLimitSince = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recentForIp = await db
      .select()
      .from(kiRequests)
      .where(and(eq(kiRequests.ip, ip), gte(kiRequests.createdAt, rateLimitSince)))
      .orderBy(desc(kiRequests.createdAt))
      .limit(1);

    if (recentForIp.length > 0) {
      const last = recentForIp[0];
      const msLeft = RATE_LIMIT_MINUTES * 60 * 1000 - (Date.now() - new Date(last.createdAt!).getTime());
      const minLeft = Math.ceil(msLeft / 60000);
      res.json({
        status: "cached",
        inhalt: last.inhalt,
        retryInMinutes: minLeft,
      });
      return;
    }

    const alleEintraege = await db
      .select({
        name: interessenten.name,
        statement: interessenten.statement,
        song: interessenten.song,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt));

    if (alleEintraege.length === 0) {
      res.json({ status: "empty", inhalt: null });
      return;
    }

    const statements = alleEintraege.filter((e) => e.statement).map((e) => e.statement as string);
    const names = alleEintraege.filter((e) => e.statement).map((e) => e.name);
    const songs = alleEintraege.filter((e) => e.song).map((e) => e.song as string);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildPrompt(statements, names, songs) }],
    });

    const inhalt = message.content[0].type === "text" ? message.content[0].text : "";

    await db.insert(kiRequests).values({ ip, inhalt });

    res.json({ status: "fresh", inhalt, remaining: DAILY_LIMIT - todayCount - 1 });
  } catch (err) {
    console.error("Stimmung error:", err);
    res.status(500).json({ error: "KI momentan nicht erreichbar" });
  }
});

export default router;
