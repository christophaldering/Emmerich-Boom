import { useReveal } from "@/hooks/useReveal";

const ZEILEN = [
  "— Verbindlich. Wer sich anmeldet, kommt.",
  "— 10 € pro Person. Egal wie alt, egal wie viele.",
  "— Bis Sonntag, 28. Juni. Danach machen wir zu.",
];

export default function DreiZeilen() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 4rem" }}
    >
      <div
        className="reveal d1"
        style={{
          borderLeft: "4px solid var(--amber)",
          paddingLeft: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
        }}
      >
        {ZEILEN.map((z, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(1rem, 2.4vw, 1.15rem)",
              lineHeight: 1.7,
              color: "var(--warm)",
              margin: 0,
            }}
          >
            {z}
          </p>
        ))}
      </div>
    </section>
  );
}
