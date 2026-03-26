import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "emmerich_ki_historie";
const MAX_HISTORY = 5;

interface HistoryEntry {
  inhalt: string;
  ts: number;
}

interface ApiResponse {
  status?: string;
  inhalt?: string | null;
  retryInMinutes?: number;
  error?: string;
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

function HistoryItem({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid rgba(232,153,26,0.10)", padding: "0.6rem 0" }}>
      <button onClick={() => setOpen(v => !v)} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: 0,
      }}>
        <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,232,200,0.60)" }}>
          {index === 0 ? "Vorherige" : `Prognose ${index + 1}`} · {formatTime(entry.ts)}
        </span>
        <span style={{ color: "rgba(232,153,26,0.55)", fontSize: "0.65rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(245,232,200,0.82)", marginTop: "0.6rem", marginBottom: 0 }}>
          {entry.inhalt}
        </p>
      )}
    </div>
  );
}

export default function KiStimmung() {
  const [loading, setLoading] = useState(false);
  const [inhalt, setInhalt] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [needsFade, setNeedsFade] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
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

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 3.5rem" }}>
      <style>{`
        .ki-intro-label {
          display: inline-block;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.75;
          margin-bottom: 0.6rem;
        }
        .ki-intro-text {
          font-family: 'Lora', serif;
          font-size: 1rem;
          line-height: 1.75;
          color: rgba(245,232,200,0.85);
          margin-bottom: 1.2rem;
        }
        .ki-result-wrap {
          position: relative;
          margin-bottom: 0.5rem;
        }
        .ki-result-text {
          font-family: 'Lora', serif;
          font-size: 1rem;
          line-height: 1.9;
          color: rgba(245,232,200,0.90);
          margin: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .ki-result-text.collapsed {
          max-height: calc(1.85em * 4);
        }
        .ki-result-text.expanded-text {
          max-height: 40em;
        }
        .ki-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3em;
          background: linear-gradient(to bottom, transparent, var(--black));
          pointer-events: none;
        }
        .ki-read-more {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.4rem 0 0;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: rgba(232,153,26,0.72);
          transition: color 0.2s;
          display: block;
        }
        .ki-read-more:hover { color: var(--amber); }
        .ki-ask-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: transparent;
          border: 1px solid rgba(232,153,26,0.45);
          border-radius: 3px;
          padding: 0.7rem 1.4rem;
          color: rgba(245,232,200,0.88);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .ki-ask-btn:hover:not(:disabled) {
          border-color: rgba(232,153,26,0.75);
          background: rgba(232,153,26,0.06);
          color: var(--warm);
        }
        .ki-ask-btn:disabled { opacity: 0.4; cursor: default; }
        .ki-spinner {
          display: inline-block;
          width: 10px; height: 10px;
          border: 1.5px solid rgba(232,153,26,0.2);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: ki-spin 0.7s linear infinite;
        }
        @keyframes ki-spin { to { transform: rotate(360deg); } }
        .ki-notice {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: rgba(245,232,200,0.70);
          margin-top: 0.7rem;
          line-height: 1.6;
        }
        .ki-again {
          display: inline-block;
          margin-top: 0.9rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.9rem;
          color: rgba(232,153,26,0.60);
          transition: color 0.2s;
          padding: 0;
        }
        .ki-again:hover { color: rgba(232,153,26,0.90); }
        .ki-history-btn {
          background: none; border: none; cursor: pointer;
          padding: 0.8rem 0 0.2rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.88rem;
          color: rgba(245,232,200,0.50);
          transition: color 0.2s;
          display: block;
        }
        .ki-history-btn:hover { color: rgba(245,232,200,0.75); }
      `}</style>

      <span className="ki-intro-label">Kurzer Exkurs</span>
      <p className="ki-intro-text">
        Wir sind ja nicht nur ewig gestrig — daher kurz der Rückgriff auf zeitgemäße Tools:
        Was sagt eigentlich die KI zu dem, was bisher von euch reinkommt?
      </p>

      {!inhalt && !loading && (
        <button className="ki-ask-btn" onClick={analyse}>
          ✦ KI-Prognose für den Abend
        </button>
      )}

      {loading && (
        <button className="ki-ask-btn" disabled>
          <span className="ki-spinner" /> KI grübelt …
        </button>
      )}

      {notice && !inhalt && (
        <p className="ki-notice">{notice}</p>
      )}

      {inhalt && (
        <>
          <div className="ki-result-wrap">
            <p
              ref={textRef}
              className={`ki-result-text ${expanded ? "expanded-text" : "collapsed"}`}
            >
              {inhalt}
            </p>
            {!expanded && needsFade && <div className="ki-fade" />}
          </div>

          {needsFade && (
            <button className="ki-read-more" onClick={() => setExpanded(v => !v)}>
              {expanded ? "weniger anzeigen ▲" : "vollständig lesen ▼"}
            </button>
          )}

          {notice && <p className="ki-notice">{notice}</p>}

          <button className="ki-again" onClick={analyse} disabled={loading}>
            ↺ nochmal fragen
          </button>

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
