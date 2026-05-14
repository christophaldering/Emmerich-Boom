import { useState } from "react";

const sections = [
  {
    title: "Impressum",
    content: (
      <div style={{ padding: "1.2rem 0 0.5rem", fontSize: "0.85rem", lineHeight: 1.9, color: "var(--fg-55)" }}>
        <p>Angaben gemäß § 5 TMG<br />
        Christoph Aldering<br />
        Jakob-Troost-Straße 8<br />
        46446 Emmerich am Rhein</p>
        <br />
        <p>Verantwortlich i.S.d.P.<br />
        Christoph Aldering (Anschrift s.o.)</p>
        <br />
        <p>Kontakt<br />
        E-Mail: christoph.aldering(AT)googlemail.com</p>
        <br />
        <p>Hinweis<br />
        Diese Website dient ausschließlich der Ankündigung und Organisation einer privaten, nicht-kommerziellen Veranstaltung des BoomerClub Emmerich.</p>
      </div>
    ),
  },
  {
    title: "Datenschutz",
    content: (
      <div style={{ padding: "1.2rem 0 0.5rem", fontSize: "0.85rem", lineHeight: 1.9, color: "var(--fg-55)" }}>
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Verantwortlicher</strong><br />
        Christoph Aldering, Jakob-Troost-Straße 8, 46446 Emmerich am Rhein<br />
        E-Mail: christoph.aldering(AT)googlemail.com</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Welche Daten wir speichern</strong><br />
        Bei der verbindlichen Anmeldung werden folgende Angaben gespeichert: Name, E-Mail-Adresse, Telefonnummer (optional), Bezahlweg, Personenanzahl sowie optionale Angaben (Lieblingssong, persönliches Statement).</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Zweck der Datenerhebung</strong><br />
        Die Angaben dienen ausschließlich der internen Planung und Organisation der Veranstaltung „Emmerich boomt!" und werden nicht an Dritte weitergegeben.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Speicherdauer</strong><br />
        Die Daten werden bis zum 30. September 2026 vollständig gelöscht.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Hosting</strong><br />
        Die Website wird gehostet bei Replit Inc., USA. Es bestehen Standardvertragsklauseln zur Datenverarbeitung gemäß Art. 46 DSGVO.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Rechtsgrundlage</strong><br />
        Die Verarbeitung erfolgt auf Grundlage Ihrer freiwilligen Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO durch Absenden des Formulars.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Ihre Rechte</strong><br />
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) sowie Widerspruch (Art. 21). Anfragen bitte per E-Mail an die oben genannte Adresse. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.</p>
      </div>
    ),
  },
  {
    title: "Kontakt",
    content: (
      <div style={{ padding: "1.2rem 0 0.5rem", fontSize: "0.85rem", lineHeight: 1.9, color: "var(--fg-55)" }}>
        <p>Fragen, Anregungen, Feedback — gerne direkt per E-Mail:<br />
        christoph.aldering(AT)googlemail.com</p>
        <br />
        <p>Christoph Aldering<br />
        Jakob-Troost-Straße 8<br />
        46446 Emmerich am Rhein</p>
      </div>
    ),
  },
];

export default function LegalPhase2() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 4rem" }}>
      <style>{`
        .legal2-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-bottom: 1px solid var(--fg-08);
          padding: 0.9rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--fg-35);
        }
        .legal2-plus {
          color: var(--fg-25);
          font-size: 1.1rem;
          transition: transform 0.3s;
        }
        .legal2-plus.open { transform: rotate(45deg); }
        .legal2-content {
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
      `}</style>

      {sections.map((s, i) => (
        <div key={i}>
          <button className="legal2-btn" onClick={() => setOpen(open === i ? null : i)}>
            {s.title}
            <span className={`legal2-plus ${open === i ? "open" : ""}`}>+</span>
          </button>
          <div className="legal2-content" style={{ maxHeight: open === i ? "1400px" : "0" }}>
            {s.content}
          </div>
        </div>
      ))}
    </section>
  );
}
