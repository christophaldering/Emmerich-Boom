import { useReveal } from "@/hooks/useReveal";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigateToAnmeldung() {
  window.history.pushState({}, "", `${BASE}/anmeldung`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Phase2Aufruf() {
  const ref = useReveal();

  const { data: stats } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60_000 },
  });

  const verfuegbar = stats?.verfuegbar ?? null;
  const kapazitaet = stats?.kapazitaet ?? 275;
  const ausgebucht = verfuegbar !== null && verfuegbar === 0;

  return (
    <section
      ref={ref}
      style={{
        background: "var(--bg-page)",
        padding: "3rem 2rem 3.5rem",
        borderBottom: "1px solid var(--amber-25)",
      }}
    >
      <style>{`
        .p2a-inner {
          max-width: 640px;
          margin: 0 auto;
        }
        .p2a-divider {
          width: 2.5rem;
          height: 2px;
          background: var(--amber);
          opacity: 0.45;
          margin-bottom: 2.4rem;
        }
        .p2a-body {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.95rem, 2.2vw, 1.08rem);
          line-height: 1.85;
          color: var(--fg-85);
          margin: 0 0 1.1rem;
          max-width: 540px;
        }
        .p2a-count {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: clamp(1.15rem, 3vw, 1.4rem);
          color: var(--amber);
          letter-spacing: 0.01em;
          margin: 0 0 2rem;
        }
        .p2a-btn {
          display: inline-block;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-style: italic;
          font-size: 1rem;
          color: var(--black);
          background: var(--amber);
          border: none;
          border-radius: 3px;
          padding: 0.85rem 2rem;
          cursor: pointer;
          transition: filter 0.2s;
          text-decoration: none;
        }
        .p2a-btn:hover { filter: brightness(1.08); }
        .p2a-btn-outline {
          display: inline-block;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-style: italic;
          font-size: 1rem;
          color: var(--amber);
          background: transparent;
          border: 2px solid var(--amber);
          border-radius: 3px;
          padding: 0.85rem 2rem;
          cursor: pointer;
          transition: filter 0.2s;
          text-decoration: none;
        }
        .p2a-btn-outline:hover { filter: brightness(1.15); }
      `}</style>

      <div className="p2a-inner">
        <div className="p2a-divider reveal d1" />

        {ausgebucht ? (
          <>
            <p className="p2a-body reveal d2">
              Wir hatten uns so sehr gewünscht, dass dieser Abend etwas wird.
              Dass er das offenbar schon ist, bevor er begonnen hat — das freut uns von Herzen.
              Und macht es uns gleichzeitig so schwer, Nein zu sagen.
            </p>
            <p className="p2a-body reveal d2" style={{ marginBottom: "2rem" }}>
              Alle 275 Plätze sind vergeben. Wer trotzdem noch dabei sein möchte,
              kann sich auf die Warteliste setzen lassen. Wenn ein Platz frei wird,
              melden wir uns — versprochen, ohne Umwege.
            </p>
            <button
              className="p2a-btn-outline reveal d3"
              onClick={navigateToAnmeldung}
            >
              Auf die Warteliste →
            </button>
          </>
        ) : (
          <>
            <p className="p2a-body reveal d2">
              Wir sind eine Generation, die gelernt hat: Man kann nicht alles haben.
              Nicht jede Platte, nicht jeden Abend, nicht jeden Platz.
              Das Leben ist endlich — und manchmal auch der Saal.
            </p>
            <p className="p2a-body reveal d2">
              Wir haben uns gefreut wie lange nicht mehr, als klar wurde,
              dass so viele von euch dabei sein wollen. Und wir haben uns schwer
              getan mit dem, was jetzt folgt: Mehr als{" "}
              <strong style={{ color: "var(--warm)", fontWeight: 600 }}>275&nbsp;Personen</strong>{" "}
              sind leider nicht drin. Die Umstände wollen es so — nicht wir.
            </p>

            {verfuegbar !== null && (
              <p className="p2a-count reveal d3">
                Noch {verfuegbar} von {kapazitaet} Plätzen verfügbar.
              </p>
            )}

            <button
              className="p2a-btn reveal d3"
              onClick={navigateToAnmeldung}
            >
              Jetzt anmelden →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
