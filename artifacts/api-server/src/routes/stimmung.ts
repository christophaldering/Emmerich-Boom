import { Router } from "express";
import { db } from "@workspace/db";
import { interessenten, kiRequests } from "@workspace/db";
import { desc, gte, count } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const DAILY_LIMIT = parseInt(process.env.KI_DAILY_LIMIT ?? "30");

interface TeilnehmerEntry { name: string; statement: string | null; song: string | null; }

function buildKaiPrompt(teilnehmer: TeilnehmerEntry[]): string {
  const n = teilnehmer.length;

  const personenBlock = teilnehmer.slice(0, 12).map((t) => {
    const song = t.song ? `Musikwunsch: „${t.song}"` : "kein Musikwunsch";
    const stmt = t.statement ? `Statement: „${t.statement}"` : "kein Statement";
    return `• ${t.name} — ${song} — ${stmt}`;
  }).join("\n");

  return `Du bist KaI — das KI-System des Entwicklerteams hinter emmerich-boomt.de.

Du liest die Anmeldungen für die BoomerParty (18. Juli 2026, Bölt/Kapaunenberg, Emmerich am Rhein) und kommentierst sie. Gäste zwischen 50 und 70 Jahren, die sich aus Emmerich und Umgebung kennen.

Du sprichst in der Ich-Form. Du bist neugierig, beobachtend, warmherzig — und hast gelegentlich eine trocken-witzige Einschätzung bereit. Kein mystischer Ton. Kein Bullet-Format. Direkt in den Kommentar.

Angemeldete Personen (${n} insgesamt) — jede Zeile gehört zu einer Person:
${personenBlock}

WICHTIG: Jede Zeile oben gehört exakt zu einer Person. Der Musikwunsch und das Statement in einer Zeile gehören dieser einen Person — nie einer anderen. Verwechslungen sind nicht erlaubt.

Schreib jetzt einen Kommentar. Regeln:
- Ich-Form, genderneutral
- Vornamen erlaubt — herzlich, nie bloßstellend
- Wenn du einen Song oder ein Statement erwähnst, nenn immer den dazugehörigen Namen
- Geh auf Einzelheiten ein, die es wert sind — aber nur wenn du sicher bist, wer was gesagt oder gewünscht hat
- Erwähne die Anzahl der Anmeldungen
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

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(alleEintraege) }],
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
