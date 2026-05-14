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
        118 Daumen hoch. Wir sind ehrlich gesagt baff.
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
            Jetzt wird's konkret. In Phase 1 wollten wir bewusst keine Daten von euch — wer
            kommt, sollte einfach Lust sagen können, ohne Formular und ohne sich auszuweisen.
            Jetzt geht es nicht mehr anders: Damit wir euch die Tickets schicken können und am
            Einlass wissen, wer dazugehört, brauchen wir Namen und eine Mailadresse. Und einen
            Zehner pro Person.
          </p>
        </div>
      </div>
    </section>
  );
}
