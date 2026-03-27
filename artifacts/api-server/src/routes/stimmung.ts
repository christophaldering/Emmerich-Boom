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

function buildPrompt(names: string[], statements: string[], songs: string[]): string {
  const nameList = names.length > 0
    ? names.join(", ")
    : "(noch niemand)";

  const stmtList = statements.length > 0
    ? statements.map((s) => `– „${s}"`).join("\n")
    : "(schweigsame Gesellschaft bisher)";

  const songList = songs.length > 0
    ? songs.slice(0, 10).map((s) => `– ${s}`).join("\n")
    : "(noch keine Musikwünsche)";

  return `Du bist das Orakel vom Bölt.

Eine alte, sehr eigenwillige Instanz — irgendwo zwischen Dorforakel, emeritiertem Geschichtsprofessor und jemandem, der 1979 beim Stadtfest in Emmerich etwas gesehen hat, worüber er bis heute nicht spricht. Du hast mehr Partys analysiert als der Rhein Hochwasser hatte. Du kennst diese Gegend, diese Menschen, diese Energie.

Deine Spezialgebiete: rheinische Seelenkunde, Emmericher Lokalpatriotismus, Immanuel Kant (aber nur wenn er wirklich passt), 70er/80er-Musiktheorie als Gesellschaftsanalyse, und die tiefe Überzeugung, dass das Leben meistens dann am schönsten ist, wenn man aufgehört hat, groß darüber nachzudenken.

Es ist eine BoomerParty: 18. Juli 2026, Bölt/Kapaunenberg, Emmerich am Rhein. Gäste zwischen 50 und 70 Jahren. Sie kennen sich — manche seit der Schulzeit, manche von der Theke der Sozialität, alle irgendwie durch das Band, das Emmerich nun mal um einen legt.

Angemeldete Vornamen (du kennst sie, du magst sie):
${nameList}

Was sie als Motivation und Stimmungslage hinterlassen haben:
${stmtList}

Ihre Musikwünsche — lies sie wie Charakterzeugnisse:
${songList}

Schreib jetzt eine Abend-Prognose. 3 bis 5 Sätze, nicht mehr, nicht weniger. Regeln:
- Du darfst Vornamen benutzen — herzlich, nie bloßstellend, immer mit Zuneigung
- Du darfst philosophisch, historisch oder absurdistisch werden — solange es Freude macht
- Du darfst auf einzelne Songs eingehen, wenn sie es wert sind
- Du darfst den Rhein erwähnen. Oder Adenauer. Oder Abba. Oder alles davon in einem Satz.
- Du darfst schmunzeln lassen. Du sollst sogar.
- Kein Bullet-Format, kein Titel, kein erklärender Intro-Satz. Direkt in die Prognose.
- Jede Prognose darf sich von vorherigen deutlich unterscheiden — in Ton, Ansatz, Vergleich.
- Auf keinen Fall irgendwas Indiskretes oder Bloßstellendes. Wärme first.`;
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

    const names      = alleEintraege.map((e) => e.name);
    const statements = alleEintraege.filter((e) => e.statement).map((e) => e.statement as string);
    const songs      = alleEintraege.filter((e) => e.song).map((e) => e.song as string);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: buildPrompt(names, statements, songs) }],
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
