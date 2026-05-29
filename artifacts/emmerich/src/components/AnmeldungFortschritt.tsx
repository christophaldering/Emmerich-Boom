import { useEffect, useRef, useState } from "react";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const DOTS_PER_ROW = 15;
const DOT_STAGGER_MS = 6;

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

function DotGrid({
  count,
  visible,
}: {
  count: number;
  visible: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "5px",
        maxWidth: `${DOTS_PER_ROW * (10 + 5) - 5}px`,
        alignContent: "flex-start",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#E8991A",
            flexShrink: 0,
            opacity: visible ? 1 : 0,
            transition: visible
              ? `opacity 0.25s ease ${i * DOT_STAGGER_MS}ms`
              : "none",
          }}
        />
      ))}
    </div>
  );
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .af-label {
          animation: af-fade-up 0.6s ease-out both;
        }
        .af-comment {
          animation: af-fade-up 0.6s ease-out 0.25s both;
        }
      `}</style>

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Section label */}
        {visible && (
          <p
            className="af-label"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(0.72rem, 1.8vw, 0.82rem)",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "var(--amber)",
              opacity: 0.6,
              margin: "0 0 1.5rem",
            }}
          >
            Anmeldungen
          </p>
        )}

        {/* Main layout: number + dot grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: "2rem 3rem",
          }}
        >
          {/* Big number */}
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              fontSize: "clamp(5rem, 14vw, 7rem)",
              lineHeight: 1,
              color: "var(--amber)",
              letterSpacing: "-0.02em",
              minWidth: "2ch",
              flexShrink: 0,
            }}
          >
            {displayCount}
          </div>

          {/* Dot grid */}
          <div style={{ paddingTop: "0.5rem", flex: "1 1 auto" }}>
            <DotGrid count={angemeldete} visible={visible} />
          </div>
        </div>

        {/* Comment */}
        {visible && (
          <p
            className="af-comment"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              lineHeight: 1.65,
              color: "var(--fg-88)",
              margin: "2rem 0 0",
            }}
          >
            {getComment(angemeldete)}
          </p>
        )}
      </div>
    </section>
  );
}
