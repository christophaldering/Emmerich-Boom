import { useReveal } from "@/hooks/useReveal";
import {
  useGetInteressentenCount,
  useGetAnmeldungStats,
  getGetInteressentenCountQueryKey,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigateTo(path: string) {
  window.history.pushState({}, "", `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Phase2Aufruf() {
  const ref = useReveal();
  const { data: interesData } = useGetInteressentenCount({
    query: { queryKey: getGetInteressentenCountQueryKey(), refetchInterval: 60000 },
  });
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });

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
        }
        .p2a-secondary {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.9rem, 2.2vw, 1.05rem);
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
        .p2a-bar-wrap {
          margin-top: 1.1rem;
        }
        .p2a-bar-track {
          position: relative;
          height: 6px;
          border-radius: 3px;
          background: rgba(232,153,26,0.14);
        }
        .p2a-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          height: 100%;
          border-radius: 3px;
          background: var(--amber);
          transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
          max-width: 100%;
        }
        .p2a-bar-overflow {
          position: absolute;
          top: -3px;
          height: 12px;
          width: 3px;
          border-radius: 2px;
          background: var(--amber);
          box-shadow: 0 0 6px 2px rgba(232,153,26,0.55);
          transition: left 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .p2a-bar-marker {
          position: absolute;
          top: -4px;
          width: 2px;
          height: 14px;
          background: rgba(245,232,200,0.35);
          border-radius: 1px;
          transition: left 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .p2a-bar-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 0.5rem;
          gap: 0.5rem;
        }
        .p2a-bar-pct {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          color: var(--amber);
          opacity: 0.65;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .p2a-bar-comment {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.78rem;
          font-style: italic;
          color: var(--amber);
          opacity: 0.55;
          text-align: right;
        }
      `}</style>

      <div className="p2a-inner">
        {count !== null && (
          <div className="p2a-hero-block reveal d1" style={{ animationDelay: "0s" }}>
            <div className="p2a-count">{count}</div>
            <div className="p2a-count-label">Personen haben Interesse signalisiert</div>
            {angemeldete !== null && (
              <p className="p2a-secondary">
                → <strong>{angemeldete}</strong> davon bereits angemeldet
              </p>
            )}
            {count !== null && count > 0 && angemeldete !== null && (() => {
              const pct = Math.round((angemeldete / count) * 100);
              // Wenn mehr angemeldet als Interessenten: Track-Basis wächst mit
              const trackMax = Math.max(count, angemeldete);
              // Füllbreite relativ zu trackMax (Interessenten-Marker liegt bei count/trackMax)
              const fillW  = Math.round((angemeldete / trackMax) * 100);
              const markW  = Math.round((count       / trackMax) * 100);
              const overflow = angemeldete > count;

              const comment =
                pct < 20  ? "Wir fangen an — jede Anmeldung zählt!" :
                pct < 40  ? "Gut! Der Funke springt über." :
                pct < 60  ? "Wir kommen in Fahrt — bitte weitersagen!" :
                pct < 75  ? "Da fehlen noch einige — aber wir sind zuversichtlich." :
                pct < 90  ? "Wir nähern uns — gleich da!" :
                pct < 100 ? "Fast! Noch ein paar Boomer fehlen." :
                pct === 100 ? "Genau so viele wie ursprünglich gemeldet — Respekt." :
                pct < 115 ? "Wow — mehr als ursprünglich gemeldet. Das hätten wir nicht erwartet!" :
                pct < 130 ? "Jetzt wird's richtig voll. Ihr seid der Wahnsinn." :
                pct < 150 ? "Wir sind baff. Einfach baff." :
                "Das ist kein Boomerparty mehr — das ist eine Bewegung. 🕺";

              return (
                <div className="p2a-bar-wrap">
                  <div className="p2a-bar-track">
                    <div className="p2a-bar-fill" style={{ width: `${fillW}%` }} />
                    {/* Marker bei der ursprünglichen Interessenten-Zahl */}
                    <div className="p2a-bar-marker" style={{ left: `calc(${markW}% - 1px)` }} />
                    {/* Glühender Spike wenn Überlauf */}
                    {overflow && (
                      <div className="p2a-bar-overflow" style={{ left: `calc(${markW}% - 1px)` }} />
                    )}
                  </div>
                  <div className="p2a-bar-meta">
                    <span className="p2a-bar-pct">
                      {pct}&thinsp;% angemeldet
                    </span>
                    <span className="p2a-bar-comment">{comment}</span>
                  </div>
                </div>
              );
            })()}
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
