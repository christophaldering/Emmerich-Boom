import { PHASE2_CONFIG } from "@/config/phase2";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigateTo(path: string) {
  window.history.pushState({}, "", `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AnmeldeAufruf() {
  if (!PHASE2_CONFIG.PHASE1_BEENDET) return null;

  return (
    <section style={{
      background: "#0A0704",
      borderBottom: "2px solid rgba(232,153,26,0.35)",
      padding: "3.5rem 1.5rem 4rem",
    }}>
      <style>{`
        .anmelde-aufruf-btn {
          background: #E8991A;
          color: #0A0704;
          border: none;
          border-radius: 3px;
          padding: 1rem 2.4rem;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          transition: filter 0.18s;
          display: inline-block;
        }
        .anmelde-aufruf-btn:hover { filter: brightness(1.1); }
      `}</style>

      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <span style={{
          display: "block",
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "0.78rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#E8991A",
          marginBottom: "0.9rem",
        }}>
          Verbindliche Anmeldung
        </span>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 800,
          fontSize: "clamp(2rem, 6vw, 3rem)",
          color: "#F5E8C8",
          lineHeight: 1.15,
          marginBottom: "1.1rem",
        }}>
          Jetzt verbindlich anmelden
        </h2>

        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "1.05rem",
          color: "rgba(245,232,200,0.8)",
          lineHeight: 1.75,
          marginBottom: "2rem",
          maxWidth: "480px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          Die BoomerParty wird konkret. Sichere dir jetzt deinen Platz: 10&nbsp;€ pro Person, Anmeldung bis Ende Juni 2026.
        </p>

        <button
          className="anmelde-aufruf-btn"
          onClick={() => navigateTo("/anmeldung")}
        >
          Jetzt anmelden
        </button>
      </div>
    </section>
  );
}
