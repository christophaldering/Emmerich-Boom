import { Router } from "express";
import { db } from "@workspace/db";
import { kiRequests, anmeldungenTable } from "@workspace/db";
import { desc, gte, count, isNull, and, ne } from "drizzle-orm";
import { SERVER_CONFIG } from "../config.js";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const DAILY_LIMIT = parseInt(process.env.KI_DAILY_LIMIT ?? "30");

interface Phase2Entry { name: string; personenAnzahl: number; song: string | null; }

function buildKaiPrompt(phase2: Phase2Entry[]): string {
  const totalPersonen = phase2.reduce((sum, a) => sum + a.personenAnzahl, 0);

  const phase2Block = phase2.map((a) => {
    const song = a.song ? `Musikwunsch: „${a.song}"` : "kein Musikwunsch";
    return `• ${a.name} — ${song}`;
  }).join("\n");

  return `Du bist KaI — das KI-System des Entwicklerteams hinter emmerich-boomt.de.

Du liest die verbindlichen Anmeldungen für die BoomerParty (18. Juli 2026, Bölt/Kapaunenberg, Emmerich am Rhein) und kommentierst sie. Gäste zwischen 50 und 70 Jahren, die sich aus Emmerich und Umgebung kennen.

Du sprichst in der Ich-Form. Du bist neugierig, beobachtend, warmherzig — und hast gelegentlich eine trocken-witzige Einschätzung bereit. Kein mystischer Ton. Kein Bullet-Format. Direkt in den Kommentar.

Es sind ${totalPersonen} Personen verbindlich angemeldet.

Angemeldete mit Musikwunsch:
${phase2Block}

WICHTIG: Jede Zeile gehört exakt zu einer Buchung. Der Musikwunsch einer Zeile gehört dieser einen Buchung — nie einer anderen.

Schreib jetzt einen Kommentar. Regeln:
- Ich-Form, genderneutral
- Vornamen erlaubt — herzlich, nie bloßstellend
- Wenn du einen Song erwähnst, nenn immer den dazugehörigen Namen
- Die einzige Zahl in deinem Kommentar ist ${totalPersonen} Personen — keine andere Zahl verwenden, weder Buchungszahl noch historische Daten
- Geh auf Einzelheiten ein, die es wert sind — aber nur wenn du sicher bist, wer was gewünscht hat
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

    const anmeldungRows = await db
      .select({
        personen: anmeldungenTable.personen,
        personen_anzahl: anmeldungenTable.personen_anzahl,
        song: anmeldungenTable.song,
      })
      .from(anmeldungenTable)
      .where(and(isNull(anmeldungenTable.storniert_am), ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_DEMO_EMAIL)))
      .orderBy(desc(anmeldungenTable.created_at));

    const phase2Eintraege: Phase2Entry[] = anmeldungRows
      .map((r) => {
        const personen = r.personen as Array<{ name?: string }> | null;
        const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : "Angemeldete Person";
        return { name: firstName, personenAnzahl: r.personen_anzahl, song: r.song };
      });

    if (phase2Eintraege.length === 0) return;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(phase2Eintraege) }],
    });

    const inhalt = message.content[0].type === "text" ? message.content[0].text : "";
    if (inhalt) {
      await db.insert(kiRequests).values({ ip: "server-auto", inhalt });
    }
  } catch (err) {
    console.error("KaI auto-generate error:", err);
  }
}

const ADMIN_SECRET = "emmerich-orga-stats-2026";

router.post("/stimmung/regenerate", async (req, res) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    res.status(401).json({ error: "Nicht autorisiert" });
    return;
  }
  try {
    const anmeldungRowsRegen = await db
      .select({
        personen: anmeldungenTable.personen,
        personen_anzahl: anmeldungenTable.personen_anzahl,
        song: anmeldungenTable.song,
      })
      .from(anmeldungenTable)
      .where(and(isNull(anmeldungenTable.storniert_am), ne(anmeldungenTable.email, SERVER_CONFIG.THEKE_DEMO_EMAIL)))
      .orderBy(desc(anmeldungenTable.created_at));

    const phase2EintraegeRegen: Phase2Entry[] = anmeldungRowsRegen
      .map((r) => {
        const personen = r.personen as Array<{ name?: string }> | null;
        const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : "Angemeldete Person";
        return { name: firstName, personenAnzahl: r.personen_anzahl, song: r.song };
      });

    if (phase2EintraegeRegen.length === 0) {
      res.json({ ok: false, reason: "Keine Anmeldungen vorhanden" });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(phase2EintraegeRegen) }],
    });

    const inhalt = message.content[0].type === "text" ? message.content[0].text : "";
    if (inhalt) {
      await db.insert(kiRequests).values({ ip: "server-admin", inhalt });
      res.json({ ok: true, inhalt });
    } else {
      res.json({ ok: false, reason: "Leere Antwort von KaI" });
    }
  } catch (err) {
    console.error("KaI regenerate error:", err);
    res.status(500).json({ error: "KaI-Generierung fehlgeschlagen" });
  }
});

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
