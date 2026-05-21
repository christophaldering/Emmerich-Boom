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
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2.5rem",
          alignItems: "center",
        }}
      >
        {/* Text */}
        <div>
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

          <p
            className="reveal d1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "clamp(1.3rem, 3vw, 1.55rem)",
              color: "var(--warm)",
              lineHeight: 1.3,
              marginBottom: "1.1rem",
            }}
          >
            Du bekommst einen Stempel.
          </p>

          <p
            className="reveal d2"
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
            className="reveal d3"
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
            Und wer seine Handtasche mitbringt: die kriegt auf Wunsch ebenfalls
            einen Stempel. Das ist kein Gag —&nbsp;
            <span style={{ color: "var(--amber)" }}>das ist bereits passiert und dokumentiert</span>.
            Wir diskriminieren keine Accessoires.
          </p>
        </div>

        {/* Stempel-Bild */}
        <div
          className="reveal d2"
          style={{
            flexShrink: 0,
            width: "clamp(120px, 18vw, 180px)",
          }}
        >
          <img
            src={`${BASE}/images/stempel.jpeg`}
            alt="Stempel: Boomer Club Emmerich"
            style={{
              width: "100%",
              borderRadius: "50%",
              opacity: 0.88,
              filter: "grayscale(20%) contrast(1.05)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
