import { useState, useEffect } from "react";

const STORAGE_KEY = "emmerich_ki_historie";
const MAX_HISTORY = 5;
const TEASER_FALLBACK = "Was sagen diese Statements wirklich über die Gruppe aus — und welcher Abend kündigt sich da an? Die KI hat eine Meinung …";

interface HistoryEntry {
  inhalt: string;
  ts: number;
}

interface ApiResponse {
  status?: string;
  inhalt?: string | null;
  retryInMinutes?: number;
  remaining?: number;
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
    <div style={{ borderTop: "1px solid rgba(232,153,26,0.10)", padding: "0.65rem 0" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: 0, gap: "0.5rem",
        }}
      >
        <span style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.76rem", color: "rgba(245,232,200,0.30)" }}>
          {index === 0 ? "Vorherige Analyse" : `Analyse ${index + 1}`} · {formatTime(entry.ts)}
        </span>
        <span style={{ color: "rgba(232,153,26,0.35)", fontSize: "0.6rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", lineHeight: 1.8, color: "rgba(245,232,200,0.52)", marginTop: "0.65rem", marginBottom: 0 }}>
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
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [teaser, setTeaser] = useState<string>(TEASER_FALLBACK);

  useEffect(() => {
    const h = loadHistory();
    setHistory(h);
    if (h.length > 0) {
      const first = h[0].inhalt.replace(/^#+\s*/gm, "").trim();
      setTeaser(first.slice(0, 130));
    }
  }, []);

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
        const h = loadHistory();
        setHistory(h);
        const first = data.inhalt.replace(/^#+\s*/gm, "").trim();
        setTeaser(first.slice(0, 130));
      } else if (data.status === "cached" && data.inhalt) {
        setInhalt(data.inhalt);
        setNotice(`Deine letzte Analyse — in ${data.retryInMinutes ?? 10} Minute${(data.retryInMinutes ?? 10) !== 1 ? "n" : ""} kannst du neu anfragen.`);
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
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 3.5rem" }}>
      <style>{`
        .ki-card {
          border: 1px solid rgba(232,153,26,0.14);
          border-radius: 4px;
          overflow: hidden;
          background: rgba(232,153,26,0.025);
          transition: border-color 0.25s;
        }
        .ki-card:hover {
          border-color: rgba(232,153,26,0.28);
        }
        .ki-header {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
          padding: 1rem 1.2rem;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }
        .ki-spark {
          font-size: 0.8rem;
          color: rgba(232,153,26,0.55);
          flex-shrink: 0;
          margin-top: 0.15rem;
          transition: color 0.2s;
        }
        .ki-card:hover .ki-spark {
          color: var(--amber);
        }
        .ki-header-text {
          flex: 1;
          min-width: 0;
        }
        .ki-title {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.88rem;
          color: rgba(245,232,200,0.55);
          display: block;
          margin-bottom: 0.35rem;
          transition: color 0.2s;
        }
        .ki-card:hover .ki-title {
          color: rgba(245,232,200,0.75);
        }
        .ki-teaser-wrap {
          position: relative;
          overflow: hidden;
          max-height: 2.8em;
        }
        .ki-teaser {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.8rem;
          line-height: 1.55;
          color: rgba(245,232,200,0.25);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .ki-chevron {
          flex-shrink: 0;
          font-size: 0.58rem;
          color: rgba(232,153,26,0.3);
          margin-top: 0.2rem;
          transition: color 0.2s, transform 0.25s;
        }
        .ki-chevron.open {
          transform: rotate(180deg);
        }
        .ki-card:hover .ki-chevron {
          color: rgba(232,153,26,0.6);
        }
        .ki-body {
          padding: 0 1.2rem 1.2rem;
          animation: ki-down 0.3s ease both;
        }
        @keyframes ki-down {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
        .ki-divider {
          height: 1px;
          background: rgba(232,153,26,0.10);
          margin-bottom: 1rem;
        }
        .ki-desc {
          font-family: 'Lora', serif;
          font-size: 0.83rem;
          line-height: 1.75;
          color: rgba(245,232,200,0.35);
          margin-bottom: 1rem;
        }
        .ki-ask-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid rgba(232,153,26,0.22);
          border-radius: 3px;
          padding: 0.55rem 1.1rem;
          color: rgba(245,232,200,0.48);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.83rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .ki-ask-btn:hover:not(:disabled) {
          border-color: rgba(232,153,26,0.48);
          color: rgba(245,232,200,0.75);
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
        .ki-result-box {
          margin-top: 1rem;
          padding: 1rem 1.1rem;
          background: rgba(232,153,26,0.04);
          border: 1px solid rgba(232,153,26,0.11);
          border-radius: 3px;
          animation: ki-down 0.35s ease both;
        }
        .ki-result-text {
          font-family: 'Lora', serif;
          font-size: 0.9rem;
          line-height: 1.85;
          color: rgba(245,232,200,0.75);
          margin: 0;
        }
        .ki-notice {
          margin-top: 0.8rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.76rem;
          color: rgba(245,232,200,0.25);
          line-height: 1.5;
        }
        .ki-history-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.9rem 0 0.2rem;
        }
        .ki-history-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.73rem;
          color: rgba(245,232,200,0.20);
          transition: color 0.2s;
        }
        .ki-history-btn:hover .ki-history-label { color: rgba(245,232,200,0.38); }
      `}</style>

      <div className="ki-card">
        <button className="ki-header" onClick={() => setOpen((v) => !v)}>
          <span className="ki-spark">✦</span>
          <span className="ki-header-text">
            <span className="ki-title">Was würde eine KI dazu sagen?</span>
            <span className="ki-teaser-wrap">
              <span className="ki-teaser">„{teaser} …"</span>
            </span>
          </span>
          <span className={`ki-chevron${open ? " open" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="ki-body">
            <div className="ki-divider" />

            <p className="ki-desc">
              Jeder darf einmal anfragen — die KI analysiert alle Statements und Wunschsongs und gibt ihre ganz eigene, garantiert amüsante Einschätzung ab.
            </p>

            <button className="ki-ask-btn" onClick={analyse} disabled={loading}>
              {loading
                ? <><span className="ki-spinner" /> KI grübelt …</>
                : inhalt ? "Nochmal fragen ↺" : "✦ KI befragen"}
            </button>

            {inhalt && (
              <div className="ki-result-box">
                <p className="ki-result-text">{inhalt}</p>
                {notice && <p className="ki-notice">{notice}</p>}
              </div>
            )}

            {!inhalt && notice && (
              <p className="ki-notice" style={{ marginTop: "0.8rem" }}>{notice}</p>
            )}

            {historyWithoutCurrent.length > 0 && (
              <>
                <button className="ki-history-btn" onClick={() => setShowHistory((v) => !v)}>
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
      </div>
    </section>
  );
}
