import { useReveal } from "@/hooks/useReveal";
import {
  useGetInteressentenCount,
  useGetAnmeldungStats,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigateTo(path: string) {
  window.history.pushState({}, "", `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Phase2Aufruf() {
  const ref = useReveal();
  const { data: interesData } = useGetInteressentenCount();
  const { data: statsData } = useGetAnmeldungStats();

  const count = interesData?.count ?? null;
  const angemeldete = statsData?.angemeldete_personen ?? null;

  return (
    <section
      ref={ref}
      style={{
        background: "var(--bg-page)",
        padding: "5rem 2rem 5.5rem",
        borderBottom: "1px solid var(--amber-25)",
      }}
    >
      <style>{`
        .p2a-inner {
          max-width: 640px;
          margin: 0 auto;
        }
        .p2a-counts-row {
          display: flex;
          gap: 3.5rem;
          align-items: flex-end;
          flex-wrap: wrap;
          margin-bottom: 2.2rem;
        }
        .p2a-count-block {
          display: flex;
          flex-direction: column;
        }
        .p2a-count {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-style: italic;
          font-size: clamp(4rem, 14vw, 8rem);
          line-height: 1;
          color: var(--amber);
          margin: 0 0 0.2rem;
        }
        .p2a-count--secondary {
          font-size: clamp(3rem, 10vw, 5.5rem);
          opacity: 0.85;
        }
        .p2a-label {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.75rem, 2vw, 0.88rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.7;
        }
        .p2a-separator {
          width: 1px;
          height: 5rem;
          background: var(--amber);
          opacity: 0.25;
          align-self: center;
          flex-shrink: 0;
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
        .p2a-btn {
          display: inline-block;
          background: var(--amber);
          color: #0A0704;
          border: none;
          border-radius: 3px;
          padding: 1rem 2.4rem;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 700;
          font-size: 1.15rem;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .p2a-btn:hover {
          opacity: 0.88;
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
        {(count !== null || angemeldete !== null) && (
          <div className="reveal d1" style={{ animationDelay: "0s" }}>
            <div className="p2a-counts-row">
              {count !== null && (
                <div className="p2a-count-block">
                  <div className="p2a-count">{count}</div>
                  <div className="p2a-label">Phase&nbsp;1 · Interessiert</div>
                </div>
              )}
              {count !== null && angemeldete !== null && (
                <div className="p2a-separator" />
              )}
              {angemeldete !== null && (
                <div className="p2a-count-block">
                  <div className="p2a-count p2a-count--secondary">{angemeldete}</div>
                  <div className="p2a-label">Phase&nbsp;2 · Angemeldet</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p2a-divider reveal d2" />

        <p className="p2a-text reveal d3">
          {count !== null ? (
            <>
              <strong>{count} Leute</strong> haben Interesse signalisiert.{" "}
            </>
          ) : null}
          Jetzt geht es in die nächste Phase: Die <em>verbindliche Anmeldung</em> ist ab sofort
          möglich — und erforderlich, wenn du dabei sein willst.
          <br />
          <strong>10&nbsp;€ pro Person · Anmeldung bis 30. Juni 2026.</strong>
        </p>

        <button
          className="p2a-btn reveal"
          style={{ animationDelay: "0.6s" }}
          onClick={() => navigateTo("/anmeldung")}
        >
          → Jetzt verbindlich anmelden
        </button>
      </div>
    </section>
  );
}
