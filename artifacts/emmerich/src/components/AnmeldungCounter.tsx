import { useEffect, useRef, useState } from "react";
import {
  useGetAnmeldungStats,
  useGetInteressentenCount,
  getGetAnmeldungStatsQueryKey,
  getGetInteressentenCountQueryKey,
} from "@workspace/api-client-react";
import { INTERESSENTEN_OFFSET } from "@/lib/config";

const numStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontWeight: 800,
  fontSize: "1.65em",
  lineHeight: 1,
  display: "inline-block",
  verticalAlign: "baseline",
};

// ─── Fortschrittsbalken ───────────────────────────────────────────────────────

interface BarProps {
  angemeldete: number;
  basis: number;
}

function AnmeldungBar({ angemeldete, basis }: BarProps) {
  const [mounted, setMounted] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    raf.current = requestAnimationFrame(() => setMounted(true));
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, []);

  if (angemeldete < 1 || basis < 1) return null;

  const overflow  = angemeldete > basis;
  const trackMax  = Math.max(basis, angemeldete);
  const fillPct   = Math.min((angemeldete / trackMax) * 100, 100);
  const markerPct = (basis / trackMax) * 100;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <style>{`
        @keyframes ac-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px 3px rgba(232,153,26,0.55), 0 0 20px 6px rgba(232,153,26,0.2); }
          50%       { box-shadow: 0 0 14px 5px rgba(232,153,26,0.75), 0 0 32px 10px rgba(232,153,26,0.3); }
        }
      `}</style>

      {/* Track */}
      <div
        style={{
          position: "relative",
          height: "13px",
          borderRadius: "7px",
          background: "rgba(10,7,4,0.85)",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(232,153,26,0.1)",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: mounted ? `${fillPct}%` : "0%",
            borderRadius: "7px",
            background: "linear-gradient(90deg, #c87010 0%, #E8991A 55%, #f5b840 100%)",
            boxShadow: "0 0 6px 1px rgba(232,153,26,0.3)",
            transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Overflow: full golden fill */}
        {overflow && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "7px",
              background: "linear-gradient(90deg, #c87010 0%, #E8991A 55%, #f5b840 100%)",
              boxShadow: "0 0 8px 2px rgba(232,153,26,0.3)",
            }}
          />
        )}

        {/* Glow dot — normal mode */}
        {!overflow && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: mounted ? `${fillPct}%` : "0%",
              transform: "translate(-50%, -50%)",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#f5b840",
              animation: "ac-glow-pulse 2s ease-in-out infinite",
              transition: "left 1.1s cubic-bezier(0.22,1,0.36,1)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {/* Glow spike — overflow mode */}
        {overflow && (
          <>
            {/* Basis-Marker */}
            <div
              style={{
                position: "absolute",
                top: "-4px",
                left: `calc(${markerPct}% - 1px)`,
                width: "2px",
                height: "21px",
                background: "rgba(245,232,200,0.5)",
                borderRadius: "1px",
                zIndex: 2,
              }}
            />
            {/* Glow am rechten Rand */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "-5px",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#f5b840",
                animation: "ac-glow-pulse 1.5s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          </>
        )}
      </div>

      {/* Overflow-Label */}
      {overflow && (
        <p
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.82rem",
            color: "var(--amber)",
            opacity: 0.7,
            margin: "0.65rem 0 0",
            lineHeight: 1.6,
          }}
        >
          Alle ursprünglichen Interessenten sind dabei — und es kommen noch welche dazu.
        </p>
      )}

      {/* Basis-Marker-Label — overflow */}
      {overflow && (
        <div
          style={{
            position: "relative",
            height: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-28px",
              left: `${markerPct}%`,
              transform: "translateX(-50%)",
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "0.62rem",
              letterSpacing: "0.04em",
              color: "rgba(245,232,200,0.38)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {basis} Interessierte
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AnmeldungCounter ─────────────────────────────────────────────────────────

export default function AnmeldungCounter() {
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });
  const { data: interesData } = useGetInteressentenCount({
    query: { queryKey: getGetInteressentenCountQueryKey(), refetchInterval: 60000 },
  });

  const angemeldete  = statsData?.angemeldete_personen ?? 0;
  const interessenten = (interesData?.count ?? 0) + INTERESSENTEN_OFFSET;

  if (angemeldete < 1 && interessenten < 1) return null;

  return (
    <div style={{ padding: "2.5rem 2rem 0", maxWidth: "640px", margin: "0 auto" }}>
      <div
        style={{
          borderLeft: "3px solid rgba(232,153,26,0.45)",
          paddingLeft: "1.1rem",
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(1.05rem, 2.8vw, 1.25rem)",
            lineHeight: 1.95,
            color: "var(--fg-88)",
            margin: 0,
          }}
        >
          {interessenten > 0 && angemeldete > 0 ? (
            <>
              Von den{" "}
              <span style={{ ...numStyle, color: "var(--amber)" }}>
                {interessenten}
              </span>{" "}
              Interessenten haben sich bereits{" "}
              <span style={{ ...numStyle, color: "var(--warm)" }}>
                {angemeldete}
              </span>{" "}
              Personen verbindlich angemeldet — da geht noch was.{" "}
              Gebt es gerne in euren Netzwerken weiter: die Anmeldung ist freigeschaltet.
            </>
          ) : angemeldete > 0 ? (
            <>
              Bereits{" "}
              <span style={{ ...numStyle, color: "var(--amber)" }}>
                {angemeldete}
              </span>{" "}
              {angemeldete === 1 ? "Person hat" : "Personen haben"} sich verbindlich angemeldet.{" "}
              Gebt es gerne weiter: die Anmeldung ist freigeschaltet.
            </>
          ) : (
            <>
              <span style={{ ...numStyle, color: "var(--amber)" }}>
                {interessenten}
              </span>{" "}
              {interessenten === 1 ? "Person hat" : "Personen haben"} Interesse signalisiert.{" "}
              Gebt es gerne weiter — die verbindliche Anmeldung ist freigeschaltet.
            </>
          )}
        </p>

        <AnmeldungBar angemeldete={angemeldete} basis={interessenten} />
      </div>
    </div>
  );
}
