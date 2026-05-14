import { PHASE2_CONFIG } from "@/config/phase2";

interface ErfolgsektionProps {
  anzahl: number;
  bezahlweg: string;
}

export default function Erfolgsektion({ anzahl, bezahlweg }: ErfolgsektionProps) {
  const betrag = anzahl * PHASE2_CONFIG.PREIS_PRO_PERSON;

  return (
    <section
      id="erfolg"
      style={{
        maxWidth: "640px",
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
          margin-top: 2rem;
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

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(2rem, 6vw, 3rem)",
          color: "var(--warm)",
          lineHeight: 1.15,
          marginBottom: "1rem",
        }}
      >
        Klasse. Wir haben euch.
      </h2>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "clamp(1rem, 2.2vw, 1.1rem)",
          lineHeight: 1.8,
          color: "var(--fg-85)",
          marginBottom: "0.5rem",
        }}
      >
        {anzahl} Person{anzahl !== 1 ? "en" : ""} angemeldet — macht{" "}
        <strong style={{ color: "var(--amber)" }}>{betrag} €</strong>. Jetzt fehlt nur noch der
        Zehner pro Person.
      </p>

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
            Bar zahlen geht auch — komm im Kapaunenberg vorbei und gib den Zehner pro Person dort
            ab. Farzin oder Revse tragen euch direkt aufs Ticket ein und ihr nehmt es mit.
          </p>
          <p style={{ marginTop: "1rem", marginBottom: 0, color: "var(--fg-70)", fontStyle: "italic" }}>
            Bitte bis spätestens {PHASE2_CONFIG.ANMELDEFRIST}.
          </p>
        </div>
      )}

      {bezahlweg !== "bar" && (
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
          Wir melden uns mit eurem Ticket, sobald das Geld angekommen ist.{" "}
          Bei Fragen:{" "}
          <span style={{ color: "var(--fg-70)" }}>{PHASE2_CONFIG.KONTAKT_MAIL}</span>
        </p>
      )}

      {bezahlweg === "bar" && (
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.9rem",
            color: "var(--fg-55)",
            lineHeight: 1.7,
            marginTop: "1.5rem",
          }}
        >
          Bei Fragen:{" "}
          <span style={{ color: "var(--fg-70)" }}>{PHASE2_CONFIG.KONTAKT_MAIL}</span>
        </p>
      )}
    </section>
  );
}
