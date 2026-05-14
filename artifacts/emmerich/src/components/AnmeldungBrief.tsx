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
            Jetzt wird's konkret — und wir müssen uns kurz outen: Beim ersten Mal haben wir
            vergessen, eure Kontaktdaten abzufragen. Bisschen Boomer-Versäumnis. 😉
          </p>
          <p>
            Damit wir euch das Ticket schicken können und wisst, wer am 18. Juli mitkommt,
            brauchen wir jetzt zwei Dinge: ein paar Daten — und einen Zehner pro Person.
          </p>
        </div>
      </div>
    </section>
  );
}
