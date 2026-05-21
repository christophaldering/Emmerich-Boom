import { useEffect, useRef, useState } from "react";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const BASIS = 129;

function getComment(angemeldet: number): string {
  if (angemeldet <= 24)
    return "Erste Anmeldungen sind eingegangen. Die anderen lesen die Mail gerade zum dritten Mal.";
  if (angemeldet <= 63)
    return "Ein Drittel ist drin. Zwei Drittel haben die Mail noch nicht gefunden.";
  if (angemeldet <= 95)
    return "Mehr als die Hälfte hat gebucht. Der Rest wartet auf eine zweite Erinnerungsmail — oder auf ein Zeichen.";
  if (angemeldet <= 128)
    return "Fast alle. Ein paar prüfen noch, ob der 18. Juli wirklich ein Samstag ist.";
  if (angemeldet <= 149)
    return "Alle ursprünglichen Interessenten sind dabei — und es kommen noch welche dazu.";
  if (angemeldet <= 199)
    return "150 Leute. Das war so nicht geplant — und ist trotzdem genau richtig.";
  if (angemeldet <= 249)
    return "200 Anmeldungen. Ernsthaft. Das ist keine Geburtstagsfeier mehr, das ist eine Bewegung.";
  return "250 und mehr. Irgendwas haben wir hier losgetreten. Emmerich, wir müssen reden.";
}

function useCounter(target: number, duration = 800, active: boolean) {
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

export default function AnmeldungFortschritt() {
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });

  const angemeldete = statsData?.angemeldete_personen ?? 0;

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animatedCount = useCounter(angemeldete, 800, visible);
  // Vor der Animation immer den echten Wert zeigen — nie "0 von 129" anzeigen
  const displayCount = visible ? animatedCount : angemeldete;

  if (angemeldete < 1) return null;

  const trackMax = Math.max(BASIS, angemeldete);
  const fillPct = (angemeldete / trackMax) * 100;
  const markerPct = (BASIS / trackMax) * 100;
  const overflow = angemeldete > BASIS;

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--bg-page)",
        padding: "4rem 2rem 4.5rem",
        borderBottom: "1px solid var(--amber-25)",
      }}
    >
      <style>{`
        @keyframes af-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px 3px rgba(232,153,26,0.55), 0 0 20px 6px rgba(232,153,26,0.2); }
          50% { box-shadow: 0 0 14px 5px rgba(232,153,26,0.75), 0 0 32px 10px rgba(232,153,26,0.3); }
        }
        @keyframes af-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .af-visible .af-reveal {
          animation: af-fade-up 0.7s ease-out both;
        }
        .af-visible .af-reveal-d1 { animation-delay: 0.05s; }
        .af-visible .af-reveal-d2 { animation-delay: 0.2s; }
        .af-visible .af-reveal-d3 { animation-delay: 0.35s; }
        .af-visible .af-reveal-d4 { animation-delay: 0.5s; }
      `}</style>

      <div
        className={visible ? "af-visible" : ""}
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        {/* Heading */}
        <div
          className="af-reveal af-reveal-d1"
          style={{ marginBottom: "0.4rem" }}
        >
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(0.72rem, 1.8vw, 0.82rem)",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "var(--amber)",
              opacity: 0.6,
              margin: "0 0 0.9rem",
            }}
          >
            Anmeldungen
          </p>
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1.05rem, 2.6vw, 1.2rem)",
              lineHeight: 1.6,
              color: "var(--fg-88)",
              margin: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 800,
                fontSize: "1.25em",
                color: "var(--amber)",
              }}
            >
              {displayCount}
            </span>{" "}
            <span style={{ fontFamily: "'Lora', Georgia, serif" }}>von</span>{" "}
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontSize: "1.1em",
                color: "var(--warm)",
              }}
            >
              {BASIS}
            </span>{" "}
            <span style={{ fontFamily: "'Lora', Georgia, serif" }}>
              Interessenten haben gebucht
            </span>
          </p>
        </div>

        {/* Bar */}
        <div
          className="af-reveal af-reveal-d2"
          style={{ marginTop: "1.8rem", paddingBottom: "2rem", position: "relative" }}
        >
          {/* Track */}
          <div
            style={{
              position: "relative",
              height: "10px",
              borderRadius: "5px",
              background: "rgba(10,7,4,0.8)",
              boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(232,153,26,0.08)",
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: visible ? `${Math.min(fillPct, 100)}%` : "0%",
                borderRadius: "5px",
                background:
                  "linear-gradient(90deg, #c87010 0%, #E8991A 55%, #f5b840 100%)",
                boxShadow: "0 0 6px 1px rgba(232,153,26,0.25)",
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
              }}
            />

            {/* Glow dot at fill edge */}
            {!overflow && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: visible ? `${Math.min(fillPct, 100)}%` : "0%",
                  transform: "translate(-50%, -50%)",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#f5b840",
                  animation: "af-glow-pulse 2s ease-in-out infinite",
                  transition: "left 1.2s cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* 129-marker (visible when overflow) */}
            {overflow && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "-5px",
                    left: `calc(${markerPct}% - 1px)`,
                    width: "2px",
                    height: "20px",
                    background: "rgba(245,232,200,0.45)",
                    borderRadius: "1px",
                    transition: "left 1.2s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
                {/* Overflow fill beyond 100% track — shown as glow bar extension */}
                <div
                  style={{
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: "100%",
                    borderRadius: "5px",
                    background:
                      "linear-gradient(90deg, #c87010 0%, #E8991A 55%, #f5b840 100%)",
                    boxShadow: "0 0 6px 1px rgba(232,153,26,0.25)",
                  }}
                />
                {/* Glow spike at right edge */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-4px",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#f5b840",
                    animation: "af-glow-pulse 1.5s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>

          {/* Marker label */}
          {overflow && (
            <div
              style={{
                position: "absolute",
                top: "18px",
                left: `${markerPct}%`,
                transform: "translateX(-50%)",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.66rem",
                letterSpacing: "0.04em",
                color: "rgba(245,232,200,0.4)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {BASIS} Interessierte
            </div>
          )}
        </div>

        {/* Comment */}
        <p
          className="af-reveal af-reveal-d3"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.88rem, 2.2vw, 0.98rem)",
            lineHeight: 1.65,
            color: "var(--amber)",
            opacity: 0.52,
            margin: "0.2rem 0 0",
          }}
        >
          {getComment(angemeldete)}
        </p>
      </div>
    </section>
  );
}
