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
        E-Mail: boomerparty26(AT)emmerich-boomt.de</p>
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
        E-Mail: boomerparty26(AT)emmerich-boomt.de</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Welche Daten wir erheben</strong><br />
        In der ersten Phase (Interessensabfrage bis Ende April) werden folgende Angaben erfasst: Vor- oder Spitzname, ungefähre Personenanzahl, optionales Statement sowie ein optionaler Lieblingssong. E-Mail-Adressen oder Telefonnummern werden in dieser Phase nicht abgefragt.<br />
        In der zweiten Phase (verbindliche Anmeldung ab Mai) werden zusätzlich Vor- und Nachname, E-Mail-Adresse sowie ggf. Telefonnummer erhoben.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Zweck der Datenerhebung</strong><br />
        Die Angaben dienen ausschließlich der internen Planung und Organisation der Veranstaltung „Emmerich boomt!" und werden nicht an Dritte weitergegeben.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Speicherung</strong><br />
        Die über das Formular übermittelten Daten werden in einer Datenbank auf den Servern von Replit Inc. (USA) gespeichert. Replit verarbeitet Daten gemäß seiner Datenschutzerklärung (replit.com/site/privacy). Die Übertragung in die USA erfolgt auf Basis von Standardvertragsklauseln gemäß Art. 46 DSGVO.<br />
        Die Daten werden nur so lange gespeichert, wie es für die Veranstaltungsorganisation erforderlich ist, längstens bis drei Monate nach der Veranstaltung am 18. Juli 2026.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Rechtsgrundlage</strong><br />
        Die Verarbeitung erfolgt auf Grundlage Ihrer freiwilligen Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO durch Absenden des Formulars.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Ihre Rechte</strong><br />
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) sowie Widerspruch (Art. 21). Anfragen bitte per E-Mail an die oben genannte Adresse. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.</p>
        <br />
        <p><strong style={{ color: "var(--fg-70)", fontWeight: 600 }}>Hosting</strong><br />
        Diese Website wird über Replit Inc., 548 Market St Suite 49773, San Francisco, CA 94104, USA gehostet.</p>
      </div>
    ),
  },
  {
    title: "Kontakt",
    content: (
      <div style={{ padding: "1.2rem 0 0.5rem", fontSize: "0.85rem", lineHeight: 1.9, color: "var(--fg-55)" }}>
        <p>Fragen, Anregungen, Feedback — gerne direkt per E-Mail:<br />
        boomerparty26(AT)emmerich-boomt.de</p>
        <br />
        <p>Christoph Aldering<br />
        Jakob-Troost-Straße 8<br />
        46446 Emmerich am Rhein</p>
      </div>
    ),
  },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigate(path: string) {
  window.history.pushState({}, "", `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Legal() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 4rem" }}>
      <style>{`
        .legal-btn {
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
        .legal-plus {
          color: var(--fg-25);
          font-size: 1.1rem;
          transition: transform 0.3s;
        }
        .legal-plus.open { transform: rotate(45deg); }
        .legal-content {
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
      `}</style>

      {sections.map((s, i) => (
        <div key={i}>
          <button className="legal-btn" onClick={() => setOpen(open === i ? null : i)}>
            {s.title}
            <span className={`legal-plus ${open === i ? "open" : ""}`}>+</span>
          </button>
          <div className="legal-content" style={{ maxHeight: open === i ? "1200px" : "0" }}>
            {s.content}
          </div>
        </div>
      ))}

      {/* Programm-Link */}
      <button
        className="legal-btn"
        onClick={() => navigate("/programm")}
        style={{ borderBottom: "none" }}
      >
        Wie der Abend wird
      </button>
    </section>
  );
}
