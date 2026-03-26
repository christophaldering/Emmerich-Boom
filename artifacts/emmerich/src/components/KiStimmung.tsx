import { useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

export default function KiStimmung() {
  const [status, setStatus] = useState<Status>("idle");
  const [inhalt, setInhalt] = useState("");
  const [cached, setCached] = useState(false);

  const analyse = async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/stimmung", { cache: "no-store" });
      const data = await res.json();
      if (data.inhalt) {
        setInhalt(data.inhalt);
        setCached(data.cached);
        setStatus("done");
      } else {
        setStatus("error");
        setInhalt("Noch zu wenig Statements für eine Analyse.");
      }
    } catch {
      setStatus("error");
      setInhalt("Die KI schläft gerade. Versuch's gleich nochmal.");
    }
  };

  return (
    <section
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "0 2rem 4rem",
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
          opacity: 0.6;
          cursor: default;
        }
        .ki-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(232,153,26,0.3);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ki-result {
          margin-top: 1.5rem;
          padding: 1.4rem 1.6rem;
          background: rgba(232,153,26,0.05);
          border: 1px solid rgba(232,153,26,0.18);
          border-radius: 4px;
          animation: fadeInUp 0.5s ease both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        .ki-result p {
          font-family: 'Lora', serif;
          font-size: 0.95rem;
          line-height: 1.85;
          color: rgba(245,232,200,0.78);
        }
        .ki-meta {
          margin-top: 0.8rem;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: rgba(245,232,200,0.3);
        }
      `}</style>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.75rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--amber)",
          marginBottom: "1rem",
        }}
      >
        Was die KI dazu sagt
      </p>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: "rgba(245,232,200,0.52)",
          marginBottom: "1.2rem",
        }}
      >
        Die KI analysiert eure Statements und Wunschsongs — und gibt ihre völlig unmaßgebliche, aber garantiert amüsante Einschätzung ab.
      </p>

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
        ) : status === "done" ? (
          "Nochmal analysieren ↺"
        ) : (
          "✦ Was sagt die KI über eure Gruppe?"
        )}
      </button>

      {(status === "done" || status === "error") && inhalt && (
        <div className="ki-result">
          <p>{inhalt}</p>
          {status === "done" && (
            <p className="ki-meta">
              {cached
                ? "Gecachtes Ergebnis — wird automatisch aktualisiert wenn neue Statements eingehen."
                : "Frisch analysiert — exklusiv für dich generiert."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
