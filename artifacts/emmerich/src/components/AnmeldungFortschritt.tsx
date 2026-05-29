import { useEffect, useRef, useState } from "react";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

const BASIS = 129;
const CHIP_MILESTONES = [129, 150, 200, 250, 300];

function getTrackMax(angemeldete: number): number {
  const milestones = [129, 150, 200, 250, 300, 400, 500];
  for (const m of milestones) {
    if (angemeldete <= m) return m;
  }
  return Math.ceil(angemeldete / 100) * 100;
}

function getNextMilestone(n: number): number {
  for (const m of CHIP_MILESTONES) {
    if (n < m) return m;
  }
  return Math.ceil(n / 50) * 50;
}

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
  const displayCount = visible ? animatedCount : angemeldete;

  if (angemeldete < 1) return null;

  const overflow   = angemeldete > BASIS;
  const trackMax   = getTrackMax(angemeldete);
  const fillPct    = (angemeldete / trackMax) * 100;
  const markerPct  = (BASIS / trackMax) * 100;
  const pct        = Math.round((angemeldete / BASIS) * 100);

  // Overflow mode extras
  const basisPct   = (BASIS / trackMax) * 100;
  const bonusPct   = (angemeldete / trackMax) * 100;
  const bonusCount = angemeldete - BASIS;
  const nextMilestone = getNextMilestone(angemeldete);
  const chips = CHIP_MILESTONES
    .filter(m => m <= nextMilestone)
    .map(m => ({
      value: m,
      label: m === BASIS ? `${m} Basis` : String(m),
      achieved: m <= angemeldete,
    }));

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
        @keyframes af-glow-pulse-warm {
          0%, 100% { box-shadow: 0 0 8px 3px rgba(245,216,80,0.6), 0 0 20px 6px rgba(245,216,80,0.22); }
          50% { box-shadow: 0 0 14px 5px rgba(245,216,80,0.8), 0 0 32px 10px rgba(245,216,80,0.35); }
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
        {overflow ? (
          /* ── CELEBRATION MODE ─────────────────────────────────────── */
          <>
            {/* Label row */}
            <div
              className="af-reveal af-reveal-d1"
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "0.9rem",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "clamp(0.72rem, 1.8vw, 0.82rem)",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  opacity: 0.6,
                  margin: 0,
                }}
              >
                Anmeldungen
              </p>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "clamp(0.82rem, 2vw, 0.95rem)",
                  color: "#f5d84a",
                  letterSpacing: "0.04em",
                }}
              >
                +{bonusCount} über Basis
              </span>
            </div>

            {/* Hero headline */}
            <div className="af-reveal af-reveal-d1">
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
                <span style={{ fontFamily: "'Lora', Georgia, serif" }}>
                  Plätze vergeben
                </span>
              </p>
            </div>

            {/* Two-phase bar */}
            <div
              className="af-reveal af-reveal-d2"
              style={{ marginTop: "1.8rem", paddingBottom: "3rem", position: "relative" }}
            >
              {/* Track */}
              <div
                style={{
                  position: "relative",
                  height: "10px",
                  borderRadius: "5px",
                  background: "rgba(10,7,4,0.8)",
                  boxShadow:
                    "inset 0 1px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(232,153,26,0.08)",
                }}
              >
                {/* Phase 1: Basis fill — amber, always full */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0, left: 0,
                    width: visible ? `${basisPct}%` : "0%",
                    borderRadius: "5px 0 0 5px",
                    background:
                      "linear-gradient(90deg, #c87010 0%, #E8991A 60%, #f5b840 100%)",
                    boxShadow: "0 0 6px 1px rgba(232,153,26,0.2)",
                    transition: "width 1.0s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />

                {/* Phase 2: Bonus fill — warm/golden, grows after basis */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0,
                    left: `${basisPct}%`,
                    width: visible ? `${bonusPct - basisPct}%` : "0%",
                    borderRadius: "0 5px 5px 0",
                    background:
                      "linear-gradient(90deg, #f5c030 0%, #f5e060 100%)",
                    boxShadow: "0 0 8px 2px rgba(245,216,80,0.3)",
                    transition: "width 1.0s cubic-bezier(0.22,1,0.36,1) 0.15s",
                  }}
                />

                {/* Separator tick between phases */}
                <div
                  style={{
                    position: "absolute",
                    top: "-5px", bottom: "-5px",
                    left: `${basisPct}%`,
                    width: "2px",
                    background: "rgba(245,232,200,0.55)",
                    borderRadius: "1px",
                  }}
                />

                {/* Floating count label above bonus edge */}
                <div
                  style={{
                    position: "absolute",
                    top: "-26px",
                    left: visible ? `${bonusPct}%` : `${basisPct}%`,
                    transform: "translateX(-50%)",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "#f5e060",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    transition: "left 1.0s cubic-bezier(0.22,1,0.36,1) 0.15s",
                  }}
                >
                  {displayCount}
                </div>

                {/* Glow dot at end of bonus section */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: visible ? `${bonusPct}%` : `${basisPct}%`,
                    transform: "translate(-50%, -50%)",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#f5e060",
                    animation: "af-glow-pulse-warm 2s ease-in-out infinite",
                    transition: "left 1.0s cubic-bezier(0.22,1,0.36,1) 0.15s",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Edge labels */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.04em",
                  color: "var(--amber)",
                  opacity: 0.45,
                }}
              >
                <span>0</span>
                <span>{trackMax}</span>
              </div>

              {/* Basis marker label */}
              <div
                style={{
                  position: "absolute",
                  top: "28px",
                  left: `${basisPct}%`,
                  transform: "translateX(-50%)",
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.63rem",
                  letterSpacing: "0.04em",
                  color: "rgba(245,232,200,0.45)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {BASIS} Basis
              </div>

              {/* Milestone chips */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  marginTop: "2.1rem",
                  flexWrap: "wrap",
                }}
              >
                {chips.map((chip) => (
                  <span
                    key={chip.value}
                    style={{
                      padding: "0.22rem 0.65rem",
                      borderRadius: "20px",
                      border: chip.achieved
                        ? "1px solid rgba(245,216,80,0.45)"
                        : "1px solid rgba(232,153,26,0.28)",
                      background: chip.achieved
                        ? "rgba(245,216,80,0.08)"
                        : "transparent",
                      fontFamily: "'Lora', Georgia, serif",
                      fontSize: "0.7rem",
                      letterSpacing: "0.04em",
                      color: chip.achieved
                        ? "rgba(245,216,80,0.85)"
                        : "rgba(232,153,26,0.4)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chip.achieved ? `✓ ${chip.label}` : `→ ${chip.label}`}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── NORMAL MODE (unverändert) ─────────────────────────── */
          <>
            {/* Heading */}
            <div
              className="af-reveal af-reveal-d1"
              style={{ marginBottom: "0.4rem" }}
            >
              {/* Label row with percentage */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  margin: "0 0 0.9rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "clamp(0.72rem, 1.8vw, 0.82rem)",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    opacity: 0.6,
                    margin: 0,
                  }}
                >
                  Anmeldungen
                </p>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: "clamp(0.82rem, 2vw, 0.95rem)",
                    color: "var(--amber)",
                    opacity: 0.75,
                    letterSpacing: "0.04em",
                  }}
                >
                  {pct} %
                </span>
              </div>

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
              style={{ marginTop: "1.8rem", paddingBottom: "2.4rem", position: "relative" }}
            >
              {/* Track */}
              <div
                style={{
                  position: "relative",
                  height: "10px",
                  borderRadius: "5px",
                  background: "rgba(10,7,4,0.8)",
                  boxShadow:
                    "inset 0 1px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(232,153,26,0.08)",
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

                {/* 129-marker tick (only when overflow — not shown in normal mode) */}
                {overflow && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      left: `calc(${markerPct}% - 1px)`,
                      width: "2px",
                      height: "20px",
                      background: "rgba(245,232,200,0.45)",
                      borderRadius: "1px",
                    }}
                  />
                )}

                {/* Floating count label above glow dot */}
                <div
                  style={{
                    position: "absolute",
                    top: "-26px",
                    left: visible ? `${fillPct}%` : "0%",
                    transform: "translateX(-50%)",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "#f5b840",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    transition: "left 1.2s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  {displayCount}
                </div>

                {/* Glow dot at fill edge */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: visible ? `${fillPct}%` : "0%",
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
              </div>

              {/* Edge labels: 0 left, trackMax right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.04em",
                  color: "var(--amber)",
                  opacity: 0.45,
                }}
              >
                <span>0</span>
                <span>{trackMax}</span>
              </div>
            </div>
          </>
        )}

        {/* Comment — immer sichtbar */}
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
