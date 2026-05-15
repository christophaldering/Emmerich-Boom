import { PHASE2_CONFIG } from "@/config/phase2";
import TicketSVG from "@/components/TicketSVG";

interface ErfolgsektionProps {
  anzahl: number;
  bezahlweg: string;
  personen: string[];
  ticket_nummern: number[];
}

const BEZAHLWEG_LABEL: Record<string, string> = {
  ueberweisung: "Überweisung",
  paypal: "PayPal",
  bar: "Bar",
};

export default function Erfolgsektion({ anzahl, bezahlweg, personen, ticket_nummern }: ErfolgsektionProps) {
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
        {BEZAHLWEG_LABEL[bezahlweg] ?? bezahlweg} ·{" "}
        <strong style={{ color: "var(--amber)" }}>{betrag} €</strong> gesamt
      </p>

      {/* SVG-Tickets — eine pro Person */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {personen.map((name, i) => (
          <TicketSVG
            key={ticket_nummern[i] ?? i}
            name={name}
            nummer={ticket_nummern[i] ?? i + 1}
          />
        ))}
      </div>

      {/* Zahlungsinfos */}
      {bezahlweg === "ueberweisung" && (
        <div className="erfolg-block">
          <span className="erfolg-label">Überweisung</span>
          <p style={{ margin: 0 }}>
            <strong>Kontoinhaber:</strong> {PHASE2_CONFIG.KONTOINHABER}<br />
            <strong>IBAN:</strong> {PHASE2_CONFIG.IBAN}<br />
            <strong>Bank:</strong> {PHASE2_CONFIG.BANK}<br />
            <strong>Verwendungszweck:</strong> {PHASE2_CONFIG.VERWENDUNGSZWECK_VORLAGE}
          </p>
          <p style={{ marginTop: "1rem", marginBottom: 0, color: "var(--fg-70)", fontStyle: "italic" }}>
            Bitte bis spätestens {PHASE2_CONFIG.ANMELDEFRIST}.
          </p>
        </div>
      )}

      {bezahlweg === "paypal" && (
        <div className="erfolg-block">
          <span className="erfolg-label">PayPal</span>
          <p style={{ margin: 0 }}>
            <strong>PayPal an:</strong> {PHASE2_CONFIG.PAYPAL_LINK}<br />
            <strong>Verwendungszweck:</strong> {PHASE2_CONFIG.VERWENDUNGSZWECK_VORLAGE}
          </p>
          <p style={{ marginTop: "1rem", marginBottom: 0, color: "var(--fg-70)", fontStyle: "italic" }}>
            Bitte bis spätestens {PHASE2_CONFIG.ANMELDEFRIST}.
          </p>
        </div>
      )}

      {bezahlweg === "bar" && (
        <div className="erfolg-block">
          <span className="erfolg-label">Bar</span>
          <p style={{ margin: 0 }}>
            Kommt einfach im Kapaunenberg vorbei und gebt den Zehner pro Person ab.
            Farzin oder Revse tragen euch direkt aufs Ticket ein.
          </p>
          <p style={{ marginTop: "1rem", marginBottom: 0, color: "var(--fg-70)", fontStyle: "italic" }}>
            Bitte bis spätestens {PHASE2_CONFIG.ANMELDEFRIST}.
          </p>
        </div>
      )}

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
        Eure Tickets schicken wir euch nochmal per Mail — als PDF zum Ausdrucken oder fürs Handy.
        Bringt sie am 18. Juli mit, ein Ticket pro Person.
        Bei Fragen:{" "}
        <span style={{ color: "var(--fg-70)" }}>{PHASE2_CONFIG.KONTAKT_MAIL}</span>
      </p>
    </section>
  );
}
