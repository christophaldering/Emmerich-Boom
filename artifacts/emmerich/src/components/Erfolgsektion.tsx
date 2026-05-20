import { PHASE2_CONFIG } from "@/config/phase2";
import TicketSVG from "@/components/TicketSVG";
import TicketRueckseite from "@/components/TicketRueckseite";

interface ErfolgsektionProps {
  anzahl: number;
  personen: string[];
  ticket_nummern: number[];
}

export default function Erfolgsektion({ anzahl, personen, ticket_nummern }: ErfolgsektionProps) {
  const betrag = anzahl * PHASE2_CONFIG.PREIS_PRO_PERSON;

  return (
    <section
      id="erfolg"
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "4rem 2rem 3rem",
      }}
    >
      <style>{`
        .erfolg-block {
          background: var(--fg-03);
          border: 1px solid var(--amber-25);
          border-left: 4px solid var(--amber);
          border-radius: 0 4px 4px 0;
          padding: 1.5rem 1.6rem;
          margin-top: 0;
          font-family: 'Lora', serif;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          line-height: 1.9;
          color: var(--fg-85);
        }
        .erfolg-block strong {
          color: var(--warm);
          font-weight: 600;
        }
        .erfolg-block .erfolg-label {
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 0.6rem;
          display: block;
        }
      `}</style>

      {/* Zusammenfassung */}
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
          color: "var(--warm)",
          lineHeight: 1.2,
          marginBottom: "0.5rem",
        }}
      >
        Eure Tickets sind da.
      </p>
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.95rem",
          color: "var(--fg-65)",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}
      >
        {anzahl} {anzahl === 1 ? "Person" : "Personen"} ·{" "}
        <strong style={{ color: "var(--amber)" }}>{betrag} €</strong> gesamt
      </p>

      {/* SVG-Tickets — Vorder- + Rückseite pro Person */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2.5rem" }}>
        {personen.map((name, i) => (
          <div key={ticket_nummern[i] ?? i} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <TicketSVG
              name={name}
              nummer={ticket_nummern[i] ?? i + 1}
            />
            <p style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "11px",
              color: "#E8991A",
              opacity: 0.6,
              textAlign: "center",
              margin: "0.4rem 0 0.2rem",
            }}>
              Rückseite
            </p>
            <TicketRueckseite />
          </div>
        ))}
      </div>

      {/* Zahlungshinweis */}
      <div className="erfolg-block">
        <p style={{ margin: 0 }}>
          Geschafft — deine Anmeldung ist da! Du kannst deinen Beitrag bequem per Banküberweisung oder PayPal zahlen. Die genauen Zahlungsdaten haben wir dir gerade per E-Mail geschickt — schau gleich mal in dein Postfach (und sicherheitshalber in den Spam-Ordner).
        </p>
      </div>

      {/* Hinweis */}
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: "var(--fg-55)",
          lineHeight: 1.7,
          marginTop: "2rem",
        }}
      >
        Bringt eure Tickets am 18. Juli mit, ein Ticket pro Person.
        Bei Fragen:{" "}
        <span style={{ color: "var(--fg-70)" }}>{PHASE2_CONFIG.KONTAKT_MAIL}</span>
      </p>
    </section>
  );
}
