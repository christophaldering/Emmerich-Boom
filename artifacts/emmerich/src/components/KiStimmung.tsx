import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "emmerich_ki_historie";
const MAX_HISTORY = 5;

interface HistoryEntry { inhalt: string; ts: number; }
interface ApiResponse {
  status?: string;
  inhalt?: string | null;
  retryInMinutes?: number;
  error?: string;
}
interface Teilnehmer {
  id: number;
  name: string;
  personen: string;
  song: string | null;
  statement: string | null;
}

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
function saveToHistory(inhalt: string) {
  const next: HistoryEntry[] = [{ inhalt, ts: Date.now() }, ...loadHistory()].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function buildIntroText(liste: Teilnehmer[]): string {
  if (liste.length === 0) {
    return "Das Orakel sitzt oben auf dem Bölt und wartet. Noch ist die Liste leer — aber es ist geduldig. Es hat schließlich den Rhein kommen und gehen sehen.";
  }

  const namen = liste.map(t => t.name);
  const songs = liste.filter(t => t.song).map(t => t.song as string);
  const n = liste.length;

  const songHint = songs.length > 0 ? `„${songs[Math.floor(songs.length / 2)]}" ` : null;

  let nameStr: string;
  if (n === 1)      nameStr = namen[0];
  else if (n === 2) nameStr = `${namen[0]} und ${namen[1]}`;
  else if (n === 3) nameStr = `${namen[0]}, ${namen[1]} und ${namen[2]}`;
  else              nameStr = `${namen[0]}, ${namen[1]} und ${n - 2} weitere`;

  if (n === 1) {
    return `Das Orakel hat die erste Anmeldung gelesen. ${namen[0]} ist dabei — und das ist kein schlechter Anfang. Es hat kurz genickt, tief nachgedacht, und dann sehr leise gelächelt. ${songHint ? `Der Musikwunsch? ${songHint}— gute Wahl.` : "Eine Meinung hat es bereits. Natürlich."}`;
  }
  if (n <= 3) {
    return `Das Orakel kennt ${nameStr}. Es hat ihre Worte gelesen, ihre Musik bewertet${songHint ? ` — ${songHint}hat es besonders beeindruckt` : ""} — und es hält den Abend für vielversprechend. Sehr vielversprechend, sogar. Aber mehr verrät es erst auf Nachfrage.`;
  }
  if (n <= 8) {
    return `${n} Anmeldungen. Das Orakel kennt ${nameStr} — und hat jede Zeile gelesen. ${songHint ? `${songHint}ist dabei, was allein schon einiges verspricht. ` : ""}Es hat geschwiegen, dann genickt. Dann nochmal geschwiegen. Das ist bei ihm ein gutes Zeichen.`;
  }
  return `${n} Menschen haben sich angemeldet. Das Orakel hat sie alle gelesen — jedes Wort, jeden Songwunsch, jede zwischen den Zeilen verborgene Erwartung. Jetzt lehnt es am Bölt, sieht auf den Rhein, und lächelt. Was es dabei denkt? Frag.`;
}

function HistoryItem({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid var(--amber-10)", padding: "0.6rem 0" }}>
      <button onClick={() => setOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0 }}>
        <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-60)" }}>
          {index === 0 ? "Vorherige" : `Prognose ${index + 1}`} · {formatTime(entry.ts)}
        </span>
        <span style={{ color: "var(--amber-55)", fontSize: "0.65rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.85, color: "var(--fg-82)", marginTop: "0.6rem", marginBottom: 0 }}>
          {entry.inhalt}
        </p>
      )}
    </div>
  );
}

export default function KiStimmung() {
  const [loading, setLoading]     = useState(false);
  const [inhalt, setInhalt]       = useState<string | null>(null);
  const [notice, setNotice]       = useState<string | null>(null);
  const [expanded, setExpanded]   = useState(false);
  const [history, setHistory]     = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [teilnehmer, setTeilnehmer]   = useState<Teilnehmer[]>([]);
  const textRef   = useRef<HTMLParagraphElement>(null);
  const [needsFade, setNeedsFade] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    fetch("/api/interesse", { cache: "no-store" })
      .then(r => r.json())
      .then((d: Teilnehmer[]) => setTeilnehmer(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (inhalt && textRef.current) {
      setNeedsFade(textRef.current.scrollHeight > textRef.current.clientHeight + 4);
    }
  }, [inhalt, expanded]);

  const analyse = async () => {
    if (loading) return;
    setLoading(true);
    setNotice(null);
    setExpanded(false);
    try {
      const res = await fetch("/api/stimmung", { cache: "no-store" });
      const data: ApiResponse = await res.json();
      if (data.status === "fresh" && data.inhalt) {
        setInhalt(data.inhalt);
        saveToHistory(data.inhalt);
        setHistory(loadHistory());
      } else if (data.status === "cached" && data.inhalt) {
        setInhalt(data.inhalt);
        setNotice(`Deine letzte Prognose — in ${data.retryInMinutes ?? 10} Min. kannst du neu anfragen.`);
      } else if (data.status === "daily_limit") {
        setNotice("Tageskontingent erschöpft. Morgen wieder!");
      } else if (data.status === "empty") {
        setNotice("Noch keine Statements vorhanden — tragt euch erst ein.");
      } else {
        setNotice("Kurz nicht erreichbar — versuch's gleich nochmal.");
      }
    } catch {
      setNotice("Kurz nicht erreichbar — versuch's gleich nochmal.");
    }
    setLoading(false);
  };

  const historyWithoutCurrent = inhalt ? history.filter(h => h.inhalt !== inhalt) : history;
  const introText = buildIntroText(teilnehmer);

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 3.5rem" }}>
      <style>{`
        .ki-intro-label { display:inline-block; font-family:'Lora',serif; font-style:italic; font-size:0.75rem; letter-spacing:0.20em; text-transform:uppercase; color:var(--amber); opacity:0.75; margin-bottom:0.6rem; }
        .ki-intro-text { font-family:'Lora',serif; font-size:1rem; line-height:1.85; color:var(--fg-88); margin-bottom:1.4rem; }
        .ki-result-wrap { position:relative; margin-bottom:0.5rem; }
        .ki-result-text { font-family:'Lora',serif; font-size:1rem; line-height:1.9; color:var(--fg-90); margin:0; overflow:hidden; transition:max-height 0.4s ease; }
        .ki-result-text.collapsed { max-height:calc(1.85em * 4); }
        .ki-result-text.expanded-text { max-height:40em; }
        .ki-fade { position:absolute; bottom:0; left:0; right:0; height:3em; background:linear-gradient(to bottom, transparent, var(--bg-page)); pointer-events:none; }
        .ki-read-more { background:none; border:none; cursor:pointer; padding:0.4rem 0 0; font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--amber-72); transition:color 0.2s; display:block; }
        .ki-read-more:hover { color:var(--amber); }
        .ki-ask-btn { display:inline-flex; align-items:center; gap:0.55rem; background:transparent; border:1px solid var(--amber-45); border-radius:3px; padding:0.7rem 1.4rem; color:var(--fg-88); font-family:'Lora',serif; font-style:italic; font-size:1rem; cursor:pointer; transition:border-color 0.2s, color 0.2s, background 0.2s; }
        .ki-ask-btn:hover:not(:disabled) { border-color:var(--amber-75); background:var(--amber-06); color:var(--warm); }
        .ki-ask-btn:disabled { opacity:0.4; cursor:default; }
        .ki-spinner { display:inline-block; width:10px; height:10px; border:1.5px solid var(--amber-20); border-top-color:var(--amber); border-radius:50%; animation:ki-spin 0.7s linear infinite; }
        @keyframes ki-spin { to { transform:rotate(360deg); } }
        .ki-notice { font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--fg-70); margin-top:0.7rem; line-height:1.6; }
        .ki-again { display:inline-block; margin-top:0.9rem; background:none; border:none; cursor:pointer; font-family:'Lora',serif; font-style:italic; font-size:0.9rem; color:var(--amber-60); transition:color 0.2s; padding:0; }
        .ki-again:hover { color:var(--amber-90); }
        .ki-history-btn { background:none; border:none; cursor:pointer; padding:0.8rem 0 0.2rem; font-family:'Lora',serif; font-style:italic; font-size:0.88rem; color:var(--fg-50); transition:color 0.2s; display:block; }
        .ki-history-btn:hover { color:var(--fg-75); }
      `}</style>

      <span className="ki-intro-label">Das Orakel vom Bölt</span>
      <p className="ki-intro-text">{introText}</p>

      {!inhalt && !loading && (
        <button className="ki-ask-btn" onClick={analyse}>✦ Orakel befragen</button>
      )}
      {loading && (
        <button className="ki-ask-btn" disabled><span className="ki-spinner" /> Orakel grübelt …</button>
      )}
      {notice && !inhalt && <p className="ki-notice">{notice}</p>}

      {inhalt && (
        <>
          <div className="ki-result-wrap">
            <p ref={textRef} className={`ki-result-text ${expanded ? "expanded-text" : "collapsed"}`}>{inhalt}</p>
            {!expanded && needsFade && <div className="ki-fade" />}
          </div>
          {needsFade && (
            <button className="ki-read-more" onClick={() => setExpanded(v => !v)}>
              {expanded ? "weniger anzeigen ▲" : "vollständig lesen ▼"}
            </button>
          )}
          {notice && <p className="ki-notice">{notice}</p>}
          <button className="ki-again" onClick={analyse} disabled={loading}>↺ Orakel erneut befragen</button>
          {historyWithoutCurrent.length > 0 && (
            <>
              <button className="ki-history-btn" onClick={() => setShowHistory(v => !v)}>
                {showHistory ? "▲" : "▼"} Frühere Prognosen ({historyWithoutCurrent.length})
              </button>
              {showHistory && historyWithoutCurrent.map((entry, i) => (
                <HistoryItem key={entry.ts} entry={entry} index={i} />
              ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
