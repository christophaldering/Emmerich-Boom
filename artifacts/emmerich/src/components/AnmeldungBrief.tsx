import { useReveal } from "@/hooks/useReveal";

export default function AnmeldungBrief() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "6rem 2rem 5rem" }}
    >
      <h2
        className="reveal d1"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          lineHeight: 1.2,
          color: "var(--warm)",
          marginBottom: "2rem",
        }}
      >
        129 Daumen hoch. Wir sind ehrlich gesagt baff.
      </h2>

      <div className="reveal d2">
        <style>{`
          .anmeldung-brief p {
            font-family: 'Lora', serif;
            font-size: clamp(1rem, 2.2vw, 1.12rem);
            line-height: 1.9;
            color: var(--fg-90);
            margin-bottom: 1.4em;
          }
        `}</style>
        <div className="anmeldung-brief">
          <p>
            Die Vorabfrage war bewusst unverbindlich — kein Formular, keine Daten, einfach Ja
            sagen können. Das Ergebnis ist eindeutig: Das Interesse ist da, und das in einem
            Ausmaß, das uns wirklich überrascht hat.
          </p>
          <p>
            Das gibt uns jetzt die Grundlage, konkret zu planen: Gespräche mit dem Wirt,
            Kapazitäten, Technik, Material. All das kostet Geld — und die Organisatoren gehen
            dabei in Vorleistung. Das können wir nur verantworten, wenn wir wissen, wer wirklich
            dabei ist.
          </p>
          <p>
            Darum bitten wir jetzt um verbindliche Anmeldungen — mit Name, Mailadresse und zehn
            Euro pro Person. Wer sich in Phase 1 eingetragen hat, muss das hier nochmal tun. Der
            frühere Eintrag war kein Versprechen — und das war so gewollt. Jetzt schon.
          </p>
        </div>
      </div>
    </section>
  );
}
