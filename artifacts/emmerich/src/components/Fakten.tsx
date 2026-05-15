import { useReveal } from "@/hooks/useReveal";

export default function Fakten() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem" }}
    >
      <style>{`
        .fakten-row {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--fg-07);
        }
        .fakten-key {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1rem;
          color: var(--fg-78);
        }
        .fakten-val {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--warm);
        }
        .fakten-val small {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: var(--fg-80);
          margin-left: 0.5rem;
        }
      `}</style>

      <p
        className="reveal"
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.75rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--amber)",
          marginBottom: "1.8rem",
        }}
      >
        Das Wichtigste
      </p>

      <div className="reveal d1">
        <div className="fakten-row">
          <span className="fakten-key">Wann</span>
          <span className="fakten-val">Samstag, 18. Juli 2026 (Uhrzeit wird noch bekannt gegeben)</span>
        </div>
        <div className="fakten-row">
          <span className="fakten-key">Wo</span>
          <span className="fakten-val">Bölt / Gaststätte Kapaunenberg<small>Emmerich am Rhein</small></span>
        </div>
        <div className="fakten-row">
          <span className="fakten-key">Eintritt</span>
          <span className="fakten-val">aktuell noch ohne Kosten<small>(verbindl. Anmeldung wird im Mai abgefragt, dann werden 10 EUR fällig)</small></span>
        </div>
        <div className="fakten-row">
          <span className="fakten-key">Zugang</span>
          <span className="fakten-val">Nur mit Anmeldung</span>
        </div>
      </div>
    </section>
  );
}
