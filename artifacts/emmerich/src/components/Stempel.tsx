import { useReveal } from "@/hooks/useReveal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Stempel() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{
        background: "var(--bg-page)",
        borderBottom: "1px solid var(--amber-25)",
        padding: "4.5rem 2rem 5rem",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        {/* Eyebrow */}
        <p
          className="reveal"
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--amber)",
            marginBottom: "1.2rem",
          }}
        >
          Einlass
        </p>

        {/* Headline */}
        <p
          className="reveal d1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: "clamp(1.3rem, 3vw, 1.55rem)",
            color: "var(--warm)",
            lineHeight: 1.3,
            marginBottom: "2rem",
          }}
        >
          Du bekommst einen Stempel.
        </p>

        {/* Beweisfoto */}
        <div className="reveal d2" style={{ marginBottom: "0.75rem" }}>
          <img
            src={`${BASE}/images/stempel-foto.png`}
            alt="Stempel-Beweisfoto: Am Einlass des Bölt"
            style={{
              width: "100%",
              borderRadius: "6px",
              display: "block",
              filter: "contrast(1.04) brightness(0.97)",
            }}
          />
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "0.75rem",
              color: "var(--fg-40)",
              marginTop: "0.5rem",
              letterSpacing: "0.03em",
            }}
          >
            Dokumentiert. Am Einlass. Am Bölt. — Die Handtasche hat ebenfalls einen.
          </p>
        </div>

        {/* Texte */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            alignItems: "start",
            marginTop: "1.75rem",
          }}
        >
          <div>
            <p
              className="reveal d3"
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.98rem",
                color: "var(--fg-80)",
                lineHeight: 1.8,
                maxWidth: "420px",
              }}
            >
              Am Einlass gibt's einen auf den Handrücken —&nbsp;
              <span style={{ color: "var(--amber)" }}>Boomer Club Emmerich</span>.
              Kein Plastikarmband, kein QR-Code-Sticker. Dafür etwas, worauf man
              noch drei Tage später zeigt. Und das auch tut.
            </p>

            <p
              className="reveal d4"
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.98rem",
                color: "var(--fg-80)",
                lineHeight: 1.8,
                maxWidth: "420px",
                marginTop: "0.85rem",
              }}
            >
              Ob die Tinte vollständig unbedenklich ist? Wir gehen stark davon aus.
              Wer empfindlich reagiert oder dessen Handrücken bereits anderweitig
              verplant ist: einfach melden — Ärmel geht, Unterarm geht, Stirn
              theoretisch auch. Wir finden was.
            </p>

            <p
              className="reveal d5"
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.98rem",
                color: "var(--fg-80)",
                lineHeight: 1.8,
                maxWidth: "420px",
                marginTop: "0.85rem",
              }}
            >
              Und wer seine Handtasche mitbringt: die kriegt auf Wunsch ebenfalls
              einen Stempel. Das ist kein Gag —&nbsp;
              <span style={{ color: "var(--amber)" }}>das ist bereits passiert und dokumentiert</span>.
              Wir diskriminieren keine Accessoires.
            </p>
          </div>

          {/* Stempel-Siegel */}
          <div
            className="reveal d3"
            style={{
              flexShrink: 0,
              width: "clamp(90px, 14vw, 130px)",
              paddingTop: "0.25rem",
            }}
          >
            <img
              src={`${BASE}/images/stempel.jpeg`}
              alt="Stempel: Boomer Club Emmerich"
              style={{
                width: "100%",
                borderRadius: "50%",
                opacity: 0.82,
                filter: "grayscale(20%) contrast(1.05)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
