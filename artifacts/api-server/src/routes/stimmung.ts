import { Router } from "express";
import { db } from "@workspace/db";
import { interessenten, kiRequests, anmeldungenTable } from "@workspace/db";
import { desc, gte, count, isNull } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const DAILY_LIMIT = parseInt(process.env.KI_DAILY_LIMIT ?? "30");

interface TeilnehmerEntry { name: string; personen: string | null; statement: string | null; song: string | null; }
interface Phase2Entry { name: string; personenAnzahl: number; song: string | null; }

const PERSONEN_COUNT: Record<string, number> = {
  "Nur ich": 1, "Wir zwei": 2, "Wir drei": 3,
  "Vier auf einen Streich": 4, "Fünf oder mehr": 5,
};

function buildKaiPrompt(teilnehmer: TeilnehmerEntry[], phase2: Phase2Entry[]): string {
  const anmeldungenPhase1 = teilnehmer.length;
  const totalPersonenPhase1 = teilnehmer.reduce(
    (sum, t) => sum + (PERSONEN_COUNT[t.personen ?? ""] ?? 1), 0
  );
  const totalPersonenPhase2 = phase2.reduce((sum, a) => sum + a.personenAnzahl, 0);
  const totalAnmeldungen = anmeldungenPhase1 + phase2.length;
  const totalPersonen = totalPersonenPhase1 + totalPersonenPhase2;

  const personenBlock = teilnehmer.map((t) => {
    const anzahl = PERSONEN_COUNT[t.personen ?? ""] ?? 1;
    const wer = anzahl > 1 ? `kommt zu ${anzahl}` : "kommt alleine";
    const song = t.song ? `Musikwunsch: „${t.song}"` : "kein Musikwunsch";
    const stmt = t.statement ? `Statement: „${t.statement}"` : "kein Statement";
    return `• ${t.name} (${wer}) — ${song} — ${stmt}`;
  }).join("\n");

  const phase2Block = phase2.length > 0
    ? phase2.map((a) => {
        const wer = a.personenAnzahl > 1 ? `kommt zu ${a.personenAnzahl}` : "kommt alleine";
        const song = a.song ? `Musikwunsch: „${a.song}"` : "kein Musikwunsch";
        return `• ${a.name} (${wer}) — ${song}`;
      }).join("\n")
    : "";

  const personenHinweis = phase2.length > 0
    ? `Es gibt ${anmeldungenPhase1} Interessenten aus Phase 1 und ${phase2.length} verbindliche Anmeldungen aus Phase 2 — zusammen ${totalAnmeldungen} Anmeldungen und mindestens ${totalPersonen} Personen.`
    : totalPersonen > anmeldungenPhase1
      ? `Es gibt ${anmeldungenPhase1} Anmeldungen, aber da einige Leute mit Begleitung kommen, sind insgesamt mindestens ${totalPersonen} Personen dabei.`
      : `Es gibt ${anmeldungenPhase1} Anmeldungen — alle kommen alleine, also ${anmeldungenPhase1} Personen.`;

  const phase2Section = phase2.length > 0
    ? `\nVerbindliche Anmeldungen (Phase 2) — ${phase2.length} Buchungen, ${totalPersonenPhase2} Personen:\n${phase2Block}\n`
    : "";

  return `Du bist KaI — das KI-System des Entwicklerteams hinter emmerich-boomt.de.

Du liest die Anmeldungen für die BoomerParty (18. Juli 2026, Bölt/Kapaunenberg, Emmerich am Rhein) und kommentierst sie. Gäste zwischen 50 und 70 Jahren, die sich aus Emmerich und Umgebung kennen.

Du sprichst in der Ich-Form. Du bist neugierig, beobachtend, warmherzig — und hast gelegentlich eine trocken-witzige Einschätzung bereit. Kein mystischer Ton. Kein Bullet-Format. Direkt in den Kommentar.

${personenHinweis}

Interessenten (Phase 1) — jede Zeile gehört zu genau einer Anmeldung:
${personenBlock}
${phase2Section}
WICHTIG: Jede Zeile oben gehört exakt zu einer Anmeldung. Musikwunsch und Statement in einer Zeile gehören dieser einen Person — nie einer anderen. Keine Verwechslungen.

Schreib jetzt einen Kommentar. Regeln:
- Ich-Form, genderneutral
- Vornamen erlaubt — herzlich, nie bloßstellend
- Wenn du einen Song oder ein Statement erwähnst, nenn immer den dazugehörigen Namen
- Erwähne sowohl die Anzahl der Anmeldungen als auch die Gesamtzahl der Personen, wenn sie voneinander abweichen
- Differenziere zwischen Phase-1-Interessenten und Phase-2-Buchungen, wenn beide vorhanden sind
- Geh auf Einzelheiten ein, die es wert sind — aber nur wenn du sicher bist, wer was gesagt oder gewünscht hat
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
        personen: interessenten.personen,
        statement: interessenten.statement,
        song: interessenten.song,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt));

    if (alleEintraege.length === 0) return;

    const anmeldungRows = await db
      .select({
        personen: anmeldungenTable.personen,
        personen_anzahl: anmeldungenTable.personen_anzahl,
        song: anmeldungenTable.song,
      })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am))
      .orderBy(desc(anmeldungenTable.created_at));

    const phase2Eintraege: Phase2Entry[] = anmeldungRows
      .map((r) => {
        const personen = r.personen as Array<{ name?: string }> | null;
        const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : "Angemeldete Person";
        return { name: firstName, personenAnzahl: r.personen_anzahl, song: r.song };
      });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(alleEintraege, phase2Eintraege) }],
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
    const alleEintraege = await db
      .select({
        name: interessenten.name,
        personen: interessenten.personen,
        statement: interessenten.statement,
        song: interessenten.song,
      })
      .from(interessenten)
      .orderBy(desc(interessenten.createdAt));

    if (alleEintraege.length === 0) {
      res.json({ ok: false, reason: "Keine Anmeldungen vorhanden" });
      return;
    }

    const anmeldungRowsRegen = await db
      .select({
        personen: anmeldungenTable.personen,
        personen_anzahl: anmeldungenTable.personen_anzahl,
        song: anmeldungenTable.song,
      })
      .from(anmeldungenTable)
      .where(isNull(anmeldungenTable.storniert_am))
      .orderBy(desc(anmeldungenTable.created_at));

    const phase2EintraegeRegen: Phase2Entry[] = anmeldungRowsRegen
      .map((r) => {
        const personen = r.personen as Array<{ name?: string }> | null;
        const firstName = Array.isArray(personen) && personen[0]?.name ? personen[0].name : "Angemeldete Person";
        return { name: firstName, personenAnzahl: r.personen_anzahl, song: r.song };
      });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: buildKaiPrompt(alleEintraege, phase2EintraegeRegen) }],
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
