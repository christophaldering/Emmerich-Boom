import { Router } from "express";
import { db } from "@workspace/db";
import { interessenten, kiCache } from "@workspace/db";
import { desc } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const CACHE_HOURS = 2;

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

Schreib auf Deutsch. Locker, herzlich, mit einem Augenzwinkern. Kein Bullet-Format — fließender Text.`;
}

router.get("/stimmung", async (_req, res) => {
  try {
    const alleEintraege = await db
      .select({
        name: interessenten.name,
        statement: interessenten.statement,
        song: interessenten.song,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt));

    const count = alleEintraege.length;

    if (count === 0) {
      res.json({ inhalt: null, count: 0, cached: false });
      return;
    }

    const letzterCache = await db
      .select()
      .from(kiCache)
      .orderBy(desc(kiCache.generiertAt))
      .limit(1);

    if (letzterCache.length > 0) {
      const cache = letzterCache[0];
      const alterInMs = Date.now() - new Date(cache.generiertAt!).getTime();
      const alterInH = alterInMs / (1000 * 60 * 60);

      if (cache.eintraegeCount === count && alterInH < CACHE_HOURS) {
        res.json({ inhalt: cache.inhalt, count, cached: true });
        return;
      }
    }

    const statements = alleEintraege
      .filter((e) => e.statement)
      .map((e) => e.statement as string);
    const names = alleEintraege
      .filter((e) => e.statement)
      .map((e) => e.name);
    const songs = alleEintraege
      .filter((e) => e.song)
      .map((e) => e.song as string);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildPrompt(statements, names, songs),
        },
      ],
    });

    const inhalt =
      message.content[0].type === "text" ? message.content[0].text : "";

    await db.insert(kiCache).values({ inhalt, eintraegeCount: count });

    res.json({ inhalt, count, cached: false });
  } catch (err) {
    console.error("Stimmung error:", err);
    res.status(500).json({ error: "KI momentan nicht erreichbar" });
  }
});

export default router;
