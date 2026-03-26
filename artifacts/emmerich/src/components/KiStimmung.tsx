import { useState, useEffect } from "react";

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
  remaining?: number;
  message?: string;
  error?: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveToHistory(inhalt: string) {
  const existing = loadHistory();
  const next: HistoryEntry[] = [{ inhalt, ts: Date.now() }, ...existing].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function HistoryItem({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid rgba(232,153,26,0.10)", padding: "0.7rem 0" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: 0,
          gap: "0.5rem",
        }}
      >
        <span style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.78rem",
          color: "rgba(245,232,200,0.35)",
        }}>
          {index === 0 ? "Vorherige" : `Analyse ${index + 1}`} · {formatTime(entry.ts)}
        </span>
        <span style={{ color: "rgba(232,153,26,0.4)", fontSize: "0.65rem" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.88rem",
          lineHeight: 1.8,
          color: "rgba(245,232,200,0.55)",
          marginTop: "0.7rem",
          marginBottom: 0,
        }}>
          {entry.inhalt}
        </p>
      )}
    </div>
  );
}

export default function KiStimmung() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inhalt, setInhalt] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (open) setHistory(loadHistory());
  }, [open]);

  const analyse = async () => {
    if (loading) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/stimmung", { cache: "no-store" });
      const data: ApiResponse = await res.json();

      if (data.status === "fresh" && data.inhalt) {
        setInhalt(data.inhalt);
        saveToHistory(data.inhalt);
        setHistory(loadHistory());
        setNotice(null);
      } else if (data.status === "cached" && data.inhalt) {
        setInhalt(data.inhalt);
        setRetryIn(data.retryInMinutes ?? 10);
        setNotice(`Deine letzte Analyse — du kannst in ${data.retryInMinutes ?? 10} Minute${(data.retryInMinutes ?? 10) !== 1 ? "n" : ""} neu anfragen.`);
      } else if (data.status === "daily_limit") {
        setNotice("Die KI hat ihr Tageskontingent erreicht. Morgen wieder!");
      } else if (data.status === "empty") {
        setNotice("Noch keine Statements vorhanden — tragt euch erst ein.");
      } else {
        setNotice("KI momentan nicht erreichbar — versuch's gleich nochmal.");
      }
    } catch {
      setNotice("KI momentan nicht erreichbar — versuch's gleich nochmal.");
    }
    setLoading(false);
  };

  const historyWithoutCurrent = inhalt
    ? history.filter((h) => h.inhalt !== inhalt)
    : history;

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 3rem" }}>
      <style>{`
        .ki-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem 0;
          width: 100%;
        }
        .ki-trigger-line {
          flex: 1;
          height: 1px;
          background: rgba(232,153,26,0.15);
        }
        .ki-trigger-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.78rem;
          color: rgba(245,232,200,0.30);
          letter-spacing: 0.05em;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .ki-trigger:hover .ki-trigger-label {
          color: rgba(232,153,26,0.55);
        }
        .ki-trigger-chevron {
          font-size: 0.55rem;
          color: rgba(232,153,26,0.25);
          transition: color 0.2s;
        }
        .ki-trigger:hover .ki-trigger-chevron {
          color: rgba(232,153,26,0.55);
        }
        .ki-body {
          padding-top: 1.2rem;
          animation: ki-fadeup 0.35s ease both;
        }
        @keyframes ki-fadeup {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: none; }
        }
        .ki-desc {
          font-family: 'Lora', serif;
          font-size: 0.85rem;
          line-height: 1.75;
          color: rgba(245,232,200,0.38);
          margin-bottom: 1.1rem;
        }
        .ki-ask-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: transparent;
          border: 1px solid rgba(232,153,26,0.25);
          border-radius: 3px;
          padding: 0.6rem 1.2rem;
          color: rgba(245,232,200,0.5);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.85rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .ki-ask-btn:hover:not(:disabled) {
          border-color: rgba(232,153,26,0.5);
          color: rgba(245,232,200,0.75);
        }
        .ki-ask-btn:disabled { opacity: 0.45; cursor: default; }
        .ki-spinner {
          display: inline-block;
          width: 11px; height: 11px;
          border: 1.5px solid rgba(232,153,26,0.2);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: ki-spin 0.7s linear infinite;
        }
        @keyframes ki-spin { to { transform: rotate(360deg); } }
        .ki-result-box {
          margin-top: 1.2rem;
          padding: 1.2rem 1.4rem;
          background: rgba(232,153,26,0.04);
          border: 1px solid rgba(232,153,26,0.13);
          border-radius: 4px;
          animation: ki-fadeup 0.4s ease both;
        }
        .ki-result-text {
          font-family: 'Lora', serif;
          font-size: 0.92rem;
          line-height: 1.85;
          color: rgba(245,232,200,0.75);
          margin: 0;
        }
        .ki-notice-text {
          margin-top: 0.9rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.78rem;
          color: rgba(245,232,200,0.28);
          line-height: 1.5;
        }
        .ki-history-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 1rem 0 0.3rem;
        }
        .ki-history-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: rgba(245,232,200,0.22);
          transition: color 0.2s;
        }
        .ki-history-toggle:hover .ki-history-label {
          color: rgba(245,232,200,0.4);
        }
      `}</style>

      <button className="ki-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="ki-trigger-line" />
        <span className="ki-trigger-label">
          KI-Stimmungsanalyse {open ? "▲" : "▼"}
        </span>
        <span className="ki-trigger-line" />
      </button>

      {open && (
        <div className="ki-body">
          <p className="ki-desc">
            Jeder darf einmal anfragen — die KI analysiert Statements und Wunschsongs und gibt ihre völlig eigene, garantiert amüsante Einschätzung ab.
          </p>

          <button
            className="ki-ask-btn"
            onClick={analyse}
            disabled={loading}
          >
            {loading ? (
              <><span className="ki-spinner" /> KI grübelt …</>
            ) : inhalt ? (
              "Nochmal fragen ↺"
            ) : (
              "✦ KI befragen"
            )}
          </button>

          {inhalt && (
            <div className="ki-result-box">
              <p className="ki-result-text">{inhalt}</p>
              {notice && <p className="ki-notice-text">{notice}</p>}
            </div>
          )}

          {!inhalt && notice && (
            <p className="ki-notice-text" style={{ marginTop: "0.9rem" }}>{notice}</p>
          )}

          {historyWithoutCurrent.length > 0 && (
            <>
              <button
                className="ki-history-toggle"
                onClick={() => setShowHistory((v) => !v)}
              >
                <span className="ki-history-label">
                  {showHistory ? "▲" : "▼"} Frühere Analysen ({historyWithoutCurrent.length})
                </span>
              </button>
              {showHistory && (
                <div>
                  {historyWithoutCurrent.map((entry, i) => (
                    <HistoryItem key={entry.ts} entry={entry} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
