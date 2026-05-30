import { useReveal } from "@/hooks/useReveal";

export default function Phase2Aufruf() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{
        background: "var(--bg-page)",
        padding: "3rem 2rem 3rem",
        borderBottom: "1px solid var(--amber-25)",
      }}
    >
      <style>{`
        .p2a-inner {
          max-width: 640px;
          margin: 0 auto;
        }
        .p2a-text {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(1.05rem, 2.4vw, 1.2rem);
          line-height: 1.85;
          color: var(--fg-90);
          margin-bottom: 2.6rem;
          max-width: 520px;
        }
        .p2a-text strong {
          color: var(--warm);
          font-weight: 600;
        }
        .p2a-text em {
          color: var(--amber);
          font-style: italic;
        }
        .p2a-divider {
          width: 2.5rem;
          height: 2px;
          background: var(--amber);
          opacity: 0.45;
          margin-bottom: 2.4rem;
        }
      `}</style>

      <div className="p2a-inner">
        <div className="p2a-divider reveal d1" />

        <p className="p2a-text reveal d2">
          Die Anmeldung läuft — und läuft besser als erwartet.{" "}
          Wer noch dabei sein möchte: bis <strong>30. Juni 2026</strong> ist die Tür offen.
          <br />
          <strong>10&nbsp;€ pro Person · Zahlung per Überweisung oder PayPal.</strong>
        </p>
      </div>
    </section>
  );
}
