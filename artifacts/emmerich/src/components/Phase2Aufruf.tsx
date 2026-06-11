import { useEffect, useRef, useState } from "react";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigateToAnmeldung() {
  window.history.pushState({}, "", `${BASE}/anmeldung`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function useCounter(target: number, duration = 1000, active: boolean) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active || target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, active]);

  return value;
}

function freieColor(verfuegbar: number | null): string {
  if (verfuegbar === null) return "var(--fg-35)";
  if (verfuegbar === 0) return "#c0392b";
  if (verfuegbar < 20) return "#d35400";
  return "var(--amber)";
}

export default function Phase2Aufruf() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  const { data: stats } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60_000 },
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const angemeldet = stats?.angemeldete_personen ?? 0;
  const kapazitaet = stats?.kapazitaet ?? 275;
  const verfuegbar = stats?.verfuegbar ?? null;
  const ausgebucht = verfuegbar !== null && verfuegbar === 0;

  const animAngemeldet  = useCounter(angemeldet,  1000, visible);
  const animKapazitaet  = useCounter(kapazitaet,   600, visible);
  const animVerfuegbar  = useCounter(verfuegbar ?? 0, 1200, visible && verfuegbar !== null);

  const dispAngemeldet = visible ? animAngemeldet : angemeldet;
  const dispKapazitaet = visible ? animKapazitaet : kapazitaet;
  const dispVerfuegbar = visible ? animVerfuegbar : (verfuegbar ?? 0);

  const hasData = stats !== undefined;

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--bg-page)",
        padding: "3.5rem 2rem 4rem",
        borderBottom: "1px solid var(--amber-25)",
      }}
    >
      <style>{`
        @keyframes p2a-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .p2a-vis .p2a-c0 { animation: p2a-up 0.6s ease-out 0.00s both; }
        .p2a-vis .p2a-c1 { animation: p2a-up 0.6s ease-out 0.10s both; }
        .p2a-vis .p2a-c2 { animation: p2a-up 0.6s ease-out 0.20s both; }
        .p2a-vis .p2a-t0 { animation: p2a-up 0.6s ease-out 0.35s both; }
        .p2a-vis .p2a-t1 { animation: p2a-up 0.6s ease-out 0.50s both; }
        .p2a-vis .p2a-t2 { animation: p2a-up 0.6s ease-out 0.65s both; }

        .p2a-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          max-width: 760px;
          margin: 0 auto 3.5rem;
        }
        @media (max-width: 500px) {
          .p2a-grid {
            grid-template-columns: 1fr;
            max-width: 280px;
          }
          .p2a-card:not(:last-child) {
            border-bottom: 1px solid var(--amber-18) !important;
            border-right: none !important;
          }
        }

        .p2a-card {
          padding: 0 2rem 0 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .p2a-card:not(:first-child) {
          padding-left: 2rem;
          border-left: 1px solid var(--amber-18);
        }

        .p2a-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: clamp(4rem, 13vw, 7.5rem);
          line-height: 0.88;
          letter-spacing: -0.03em;
        }
        .p2a-label {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.72rem, 1.8vw, 0.82rem);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--fg-45);
          margin-top: 0.6rem;
        }

        .p2a-prose {
          max-width: 640px;
          margin: 0 auto;
        }
        .p2a-divider {
          width: 2.5rem;
          height: 2px;
          background: var(--amber);
          opacity: 0.4;
          margin-bottom: 2rem;
        }
        .p2a-body {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(0.95rem, 2.2vw, 1.08rem);
          line-height: 1.85;
          color: var(--fg-85);
          margin: 0 0 1.1rem;
          max-width: 540px;
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
          padding: 0.9rem 2.2rem;
          cursor: pointer;
          transition: filter 0.2s;
          margin-top: 0.5rem;
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
          padding: 0.9rem 2.2rem;
          cursor: pointer;
          transition: filter 0.2s;
          margin-top: 0.5rem;
        }
        .p2a-btn-outline:hover { filter: brightness(1.15); }
      `}</style>

      <div className={visible ? "p2a-vis" : ""}>
        {/* ── Three big numbers ── */}
        <div className="p2a-grid">
          {/* Angemeldet */}
          <div className="p2a-card p2a-c0">
            <span
              className="p2a-num"
              style={{ color: "var(--amber)", opacity: hasData ? 1 : 0.25 }}
            >
              {hasData ? dispAngemeldet : "—"}
            </span>
            <span className="p2a-label">Angemeldet</span>
          </div>

          {/* Kapazität */}
          <div className="p2a-card p2a-c1">
            <span
              className="p2a-num"
              style={{ color: "var(--warm)", opacity: 0.55 }}
            >
              {dispKapazitaet}
            </span>
            <span className="p2a-label">Plätze gesamt</span>
          </div>

          {/* Noch frei */}
          <div className="p2a-card p2a-c2">
            <span
              className="p2a-num"
              style={{ color: freieColor(verfuegbar), opacity: hasData ? 1 : 0.25 }}
            >
              {hasData ? dispVerfuegbar : "—"}
            </span>
            <span className="p2a-label" style={{ color: ausgebucht ? "#c0392b" : undefined }}>
              {ausgebucht ? "Ausgebucht" : "Noch frei"}
            </span>
          </div>
        </div>

        {/* ── Explanatory text + CTA ── */}
        <div className="p2a-prose">
          <div className="p2a-divider p2a-t0" />

          {ausgebucht ? (
            <>
              <p className="p2a-body p2a-t0">
                Wir hatten uns so sehr gewünscht, dass dieser Abend etwas wird.
                Dass er das offenbar schon ist, bevor er begonnen hat — das freut uns von Herzen.
                Und macht es uns gleichzeitig so schwer, Nein zu sagen.
              </p>
              <p className="p2a-body p2a-t1" style={{ marginBottom: "1.5rem" }}>
                Alle 275 Plätze sind vergeben. Wer trotzdem noch dabei sein möchte,
                kann sich auf die Warteliste setzen lassen. Wenn ein Platz frei wird,
                melden wir uns — versprochen, ohne Umwege.
              </p>
              <button className="p2a-btn-outline p2a-t2" onClick={navigateToAnmeldung}>
                Auf die Warteliste →
              </button>
            </>
          ) : (
            <>
              <p className="p2a-body p2a-t0">
                Wir sind eine Generation, die gelernt hat: Man kann nicht alles haben.
                Nicht jede Platte, nicht jeden Abend, nicht jeden Platz.
                Das Leben ist endlich — und manchmal auch der Saal.
              </p>
              <p className="p2a-body p2a-t1" style={{ marginBottom: "1.5rem" }}>
                Wir haben uns gefreut wie lange nicht mehr, als klar wurde,
                dass so viele von euch dabei sein wollen. Und wir haben uns schwer
                getan mit dem, was jetzt folgt: Mehr als{" "}
                <strong style={{ color: "var(--warm)", fontWeight: 600 }}>275&nbsp;Personen</strong>{" "}
                sind leider nicht drin. Die Umstände wollen es so — nicht wir.
              </p>
              <button className="p2a-btn p2a-t2" onClick={navigateToAnmeldung}>
                Jetzt anmelden →
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
