import { useReveal } from "@/hooks/useReveal";
import { PHASE2_CONFIG } from "@/config/phase2";

export default function FaktenPhase2() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem" }}
    >
      <style>{`
        .fakten2-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--fg-07);
        }
        .fakten2-key {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1rem;
          color: var(--fg-78);
        }
        .fakten2-val {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--warm);
        }
        .fakten2-val small {
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
        <div className="fakten2-row">
          <span className="fakten2-key">Wann</span>
          <span className="fakten2-val">Samstag, 18. Juli 2026<small>Beginn 20:00 Uhr</small></span>
        </div>
        <div className="fakten2-row">
          <span className="fakten2-key">Wo</span>
          <span className="fakten2-val">Bölt / Gaststätte Kapaunenberg<small>Emmerich am Rhein</small></span>
        </div>
        <div className="fakten2-row">
          <span className="fakten2-key">Eintritt</span>
          <span className="fakten2-val">{PHASE2_CONFIG.PREIS_PRO_PERSON} € pro Person<small>Musik &amp; Fingerfood</small></span>
        </div>
        <div className="fakten2-row">
          <span className="fakten2-key">Zugang</span>
          <span className="fakten2-val">Nur mit Anmeldung</span>
        </div>
        <div className="fakten2-row">
          <span className="fakten2-key">Anmeldeschluss</span>
          <span className="fakten2-val">{PHASE2_CONFIG.ANMELDEFRIST}</span>
        </div>
        <div className="fakten2-row">
          <span className="fakten2-key">Kapazität</span>
          <span className="fakten2-val">275 Plätze</span>
        </div>
      </div>
    </section>
  );
}
