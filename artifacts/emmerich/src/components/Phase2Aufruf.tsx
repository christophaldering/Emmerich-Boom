import { useReveal } from "@/hooks/useReveal";
import {
  useGetInteressentenCount,
  useGetAnmeldungStats,
  getGetInteressentenCountQueryKey,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";
import { INTERESSENTEN_OFFSET } from "@/lib/config";

export default function Phase2Aufruf() {
  const ref = useReveal();
  const { data: interesData } = useGetInteressentenCount({
    query: { queryKey: getGetInteressentenCountQueryKey(), refetchInterval: 60000 },
  });
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });

  const count = interesData?.count != null ? interesData.count + INTERESSENTEN_OFFSET : null;
  const angemeldete = statsData?.angemeldete_personen ?? null;

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
        .p2a-hero-block {
          margin-bottom: 2.2rem;
        }
        .p2a-count {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-style: italic;
          font-size: clamp(5rem, 18vw, 10rem);
          line-height: 1;
          color: var(--amber);
          margin: 0 0 0.35rem;
        }
        .p2a-count-label {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.75rem, 2vw, 0.88rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.7;
          margin-bottom: 0.9rem;
          display: flex;
          align-items: baseline;
          gap: 0.6em;
          flex-wrap: wrap;
        }
        .p2a-extra-badge {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: clamp(0.8rem, 2.2vw, 0.95rem);
          letter-spacing: 0.06em;
          text-transform: none;
          color: var(--amber);
          opacity: 1;
          font-weight: 700;
        }
        .p2a-secondary {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.9rem, 2.2vw, 1.05rem);
          font-style: italic;
          color: var(--amber);
          opacity: 0.72;
          margin: 0;
          line-height: 1.5;
        }
        .p2a-secondary strong {
          font-weight: 700;
          opacity: 1;
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
        {angemeldete !== null && (
          <div className="p2a-hero-block reveal d1" style={{ animationDelay: "0s" }}>
            <div className="p2a-count">{angemeldete}</div>
            <div className="p2a-count-label">
              <span>Boomer dabei</span>
              {count !== null && angemeldete > count && (
                <span className="p2a-extra-badge">+{angemeldete - count} extra</span>
              )}
            </div>
            {count !== null && angemeldete > count && (
              <p className="p2a-secondary">
                Das hatten wir uns erhofft — wollten es zunächst aber nicht glauben.
              </p>
            )}
            {count !== null && angemeldete <= count && (
              <p className="p2a-secondary">
                → Aus <strong>{count}</strong> Interessenten wurden {angemeldete} Anmeldungen
              </p>
            )}
          </div>
        )}

        <div className="p2a-divider reveal d2" />

        <p className="p2a-text reveal d3">
          Die Anmeldung läuft — und läuft besser als erwartet.{" "}
          Wer noch dabei sein möchte: bis <strong>30. Juni 2026</strong> ist die Tür offen.
          <br />
          <strong>10&nbsp;€ pro Person · Zahlung per Überweisung oder PayPal.</strong>
        </p>

      </div>
    </section>
  );
}
