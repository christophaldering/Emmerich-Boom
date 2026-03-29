import { useReveal } from "@/hooks/useReveal";

export default function Letter() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "6rem 2rem 5rem" }}
    >
      <p
        className="reveal d1"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "clamp(1.05rem,2.5vw,1.25rem)",
          color: "var(--amber)",
          marginBottom: "1.5rem",
        }}
      >
        Emmerich, Frühjahr 2026
      </p>

      <h1
        className="reveal d2"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(3.2rem,10vw,6.5rem)",
          lineHeight: 0.92,
          marginBottom: "1.5rem",
        }}
      >
        <span style={{ color: "var(--warm)" }}>Emmerich</span>
        <br />
        <em style={{ color: "var(--amber)", fontStyle: "italic" }}>boomt.</em>
      </h1>

      <p
        className="reveal d3"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.05rem,3vw,1.35rem)",
          color: "var(--amber)",
          letterSpacing: "0.04em",
          padding: "0.7rem 0",
          borderTop: "1px solid var(--amber-25)",
          borderBottom: "1px solid var(--amber-25)",
          marginBottom: "3rem",
        }}
      >
        18. Juli 2026 · Bölt / Gaststätte Kapaunenberg · Emmerich am Rhein
      </p>

      <div className="reveal" style={{ animationDelay: "0.55s" }}>
        <style>{`
          .letter-body p {
            font-size: clamp(1rem,2.2vw,1.12rem);
            line-height: 1.9;
            color: var(--fg-90);
            margin-bottom: 1.2em;
          }
          .letter-body strong {
            color: var(--warm);
            font-weight: 600;
          }
          .letter-body em {
            color: var(--amber);
            font-style: italic;
          }
          .bullet-list {
            list-style: none;
            margin: 1.4em 0;
            padding: 1.4rem 1.6rem;
            background: var(--fg-03);
            border-left: 2px solid var(--amber-30);
            border-radius: 0 4px 4px 0;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
          }
          .bullet-list li {
            font-size: clamp(1rem,2vw,1.05rem);
            line-height: 1.8;
            color: var(--fg-88);
            padding-left: 1.2rem;
            position: relative;
          }
          .bullet-list li::before {
            content: "—";
            position: absolute;
            left: 0;
            color: var(--amber);
          }
          .closed-note {
            margin: 1.4rem 0;
            padding: 1.2rem 1.5rem;
            background: var(--amber-06);
            border: 1px solid var(--amber-22);
            border-radius: 4px;
            font-size: clamp(1rem,2vw,1.05rem);
            line-height: 1.8;
            color: var(--fg-88);
          }
        `}</style>
        <div className="letter-body">
          <p>Wir wissen zwar noch, wie man sich ohne Handy verabredet, aber wir können auch anders. 😉</p>
          <p>Es gibt eine Party. Am <strong>18. Juli 2026</strong>. Auf dem Bölt. Ihr wisst schon — in der Gaststätte Kapaunenberg, Emmerich. Und die wird gut.</p>

          <ul className="bullet-list">
            <li>Abrocken — zu Musik, bei der man den Text noch kann</li>
            <li>70er, 80er — laut, tanzbar, kein Wenn und Aber</li>
            <li>Alte Freunde treffen — manche vielleicht nach Jahren</li>
            <li>Gespräche an der Theke, die irgendwie immer die besten sind</li>
            <li>Nostalgie — aber die gute Art, bei der einem warm ums Herz wird</li>
            <li>Fingerfood, Getränke — kein Dresscode, kein Gedöns</li>
          </ul>

          <p>Egal ob 50, 100 oder 150 Boomer — auf dem Bölt ist Platz.</p>

          <div className="closed-note">
            Kleiner Hinweis: das wird eine <em>geschlossene Gesellschaft</em> — kein offenes Stadtfest. Die Einladung richtet sich in erster Linie an Emmericher Boomer — egal, ob man noch hier wohnt, weggezogen ist oder einfach einen Bezug zur Stadt hat. Wer sich angesprochen fühlt, ist dabei. Und wer jemanden kennt, dem das gefallen könnte: <strong>gerne weitersagen.</strong>
          </div>

          <p>Ein kleines Orga-Team kümmert sich drum — in der Freizeit, ohne Budget, dafür mit Herzblut. Großes Dankeschön an <strong>Farzin und Revse vom Kapaunenberg</strong> für ihre Unterstützung.</p>

          <p>Und jetzt das Wichtigste: <strong>Wir wollen jetzt erstmal wissen, wer dabei sein will</strong> — einfach kurz melden bis <strong>Ende April</strong>. Im Mai geht's dann in die konkrete Planung, und dann kommt auch die richtige Anmeldung — <em>10 EUR für Musik und Fingerfood.</em></p>
        </div>
      </div>
    </section>
  );
}
