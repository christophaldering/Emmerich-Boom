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
    return "Das war so nicht geplant — und ist trotzdem genau richtig.";
  if (angemeldet <= 249)
    return "Ernsthaft. Das ist keine Geburtstagsfeier mehr, das ist eine Bewegung.";
  return "Irgendwas haben wir hier losgetreten. Emmerich, wir müssen reden.";
}

function useCounter(target: number, duration = 900, active: boolean) {
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

  const animatedCount = useCounter(angemeldete, 900, visible);
  const displayCount = visible ? animatedCount : angemeldete;

  if (angemeldete < 1) return null;

  const overflow    = angemeldete > BASIS;
  const bonusCount  = angemeldete - BASIS;

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
        @keyframes af-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .af-visible .af-d0 { animation: af-fade-up 0.55s ease-out 0.00s both; }
        .af-visible .af-d1 { animation: af-fade-up 0.55s ease-out 0.10s both; }
        .af-visible .af-d2 { animation: af-fade-up 0.55s ease-out 0.22s both; }
        .af-visible .af-d3 { animation: af-fade-up 0.55s ease-out 0.38s both; }
      `}</style>

      <div
        className={visible ? "af-visible" : ""}
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        {/* Label */}
        <p
          className="af-d0"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(0.72rem, 1.8vw, 0.82rem)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--amber)",
            opacity: 0.6,
            margin: "0 0 1.2rem",
          }}
        >
          Anmeldungen
        </p>

        {/* Big number */}
        <p
          className="af-d1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: "clamp(5.5rem, 18vw, 8rem)",
            lineHeight: 0.9,
            color: "var(--amber)",
            letterSpacing: "-0.03em",
            margin: "0 0 0.6rem",
          }}
        >
          {displayCount}
        </p>

        {/* Context line */}
        <p
          className="af-d2"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(1rem, 2.6vw, 1.15rem)",
            lineHeight: 1.5,
            color: "var(--fg-65)",
            margin: "0 0 0.35rem",
          }}
        >
          {overflow ? (
            <>
              Plätze vergeben
              <span
                style={{
                  marginLeft: "0.75em",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "0.82em",
                  color: "#f5d84a",
                  letterSpacing: "0.02em",
                }}
              >
                +{bonusCount} über Basis
              </span>
            </>
          ) : (
            <>
              von{" "}
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  color: "var(--warm)",
                }}
              >
                {BASIS}
              </span>{" "}
              Interessenten haben gebucht
            </>
          )}
        </p>

        {/* KaI comment */}
        <p
          className="af-d3"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.88rem, 2.2vw, 0.98rem)",
            lineHeight: 1.7,
            color: "var(--amber)",
            opacity: 0.5,
            margin: "1.2rem 0 0",
          }}
        >
          {getComment(angemeldete)}
        </p>
      </div>
    </section>
  );
}
