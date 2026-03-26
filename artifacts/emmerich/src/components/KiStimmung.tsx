import { useState } from "react";

type Status = "idle" | "loading" | "done" | "cached" | "daily_limit" | "empty" | "error";

interface ApiResponse {
  status?: string;
  inhalt?: string | null;
  retryInMinutes?: number;
  remaining?: number;
  message?: string;
  error?: string;
}

export default function KiStimmung() {
  const [status, setStatus] = useState<Status>("idle");
  const [inhalt, setInhalt] = useState("");
  const [retryIn, setRetryIn] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);

  const analyse = async () => {
    if (status === "loading") return;
    setStatus("loading");
    setInhalt("");
    try {
      const res = await fetch("/api/stimmung", { cache: "no-store" });
      const data: ApiResponse = await res.json();

      if (data.status === "fresh") {
        setInhalt(data.inhalt ?? "");
        setRemaining(data.remaining ?? null);
        setStatus("done");
      } else if (data.status === "cached") {
        setInhalt(data.inhalt ?? "");
        setRetryIn(data.retryInMinutes ?? 10);
        setStatus("cached");
      } else if (data.status === "daily_limit") {
        setStatus("daily_limit");
      } else if (data.status === "empty") {
        setInhalt("Noch keine Statements — tragt euch ein und kommt wieder!");
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const isDone = status === "done" || status === "cached";

  return (
    <section
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "0 2rem 4.5rem",
      }}
    >
      <style>{`
        .ki-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: transparent;
          border: 1px solid rgba(232,153,26,0.35);
          border-radius: 3px;
          padding: 0.75rem 1.4rem;
          color: rgba(245,232,200,0.65);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.92rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .ki-btn:hover:not(:disabled) {
          border-color: var(--amber);
          color: var(--warm);
        }
        .ki-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .ki-spinner {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 1.5px solid rgba(232,153,26,0.25);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: ki-spin 0.75s linear infinite;
        }
        @keyframes ki-spin { to { transform: rotate(360deg); } }
        .ki-result {
          margin-top: 1.5rem;
          padding: 1.4rem 1.6rem;
          background: rgba(232,153,26,0.05);
          border: 1px solid rgba(232,153,26,0.18);
          border-radius: 4px;
          animation: ki-fadeup 0.45s ease both;
        }
        @keyframes ki-fadeup {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        .ki-result p {
          font-family: 'Lora', serif;
          font-size: 0.95rem;
          line-height: 1.85;
          color: rgba(245,232,200,0.80);
          margin: 0;
        }
        .ki-meta {
          margin-top: 0.9rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: rgba(245,232,200,0.28);
          line-height: 1.5;
        }
        .ki-notice {
          margin-top: 1.2rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.875rem;
          color: rgba(245,232,200,0.4);
          line-height: 1.6;
        }
      `}</style>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.72rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--amber)",
          marginBottom: "0.9rem",
        }}
      >
        Was die KI dazu sagt
      </p>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.88rem",
          lineHeight: 1.75,
          color: "rgba(245,232,200,0.45)",
          marginBottom: "1.2rem",
        }}
      >
        Jeder darf die KI nach ihrer Einschätzung fragen — sie analysiert eure Statements und Wunschsongs und gibt eine völlig eigene, garantiert amüsante Antwort.
      </p>

      {status !== "daily_limit" && (
        <button
          className="ki-btn"
          onClick={analyse}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className="ki-spinner" />
              KI grübelt …
            </>
          ) : isDone ? (
            "Nochmal fragen ↺"
          ) : (
            "✦ Was sagt die KI über eure Gruppe?"
          )}
        </button>
      )}

      {status === "daily_limit" && (
        <p className="ki-notice">
          Die KI hat ihr Tageskontingent erreicht — kommt morgen wieder!
        </p>
      )}

      {status === "error" && (
        <p className="ki-notice">
          Die KI ist gerade nicht erreichbar. Versuch's gleich nochmal.
        </p>
      )}

      {isDone && inhalt && (
        <div className="ki-result">
          <p>{inhalt}</p>
          <p className="ki-meta">
            {status === "cached"
              ? `Das ist deine Analyse von eben — du kannst in ${retryIn} Minute${retryIn !== 1 ? "n" : ""} wieder fragen.`
              : remaining !== null
              ? `Frisch für dich generiert. ${remaining} von ${parseInt(
                  typeof window !== "undefined"
                    ? "30"
                    : "30"
                )} Analysen heute noch verfügbar.`
              : "Frisch für dich generiert."}
          </p>
        </div>
      )}
    </section>
  );
}
