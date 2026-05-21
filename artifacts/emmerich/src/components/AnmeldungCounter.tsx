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

export default function AnmeldungCounter() {
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });
  const { data: interesData } = useGetInteressentenCount({
    query: { queryKey: getGetInteressentenCountQueryKey(), refetchInterval: 60000 },
  });

  const angemeldete = statsData?.angemeldete_personen ?? 0;
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
      </div>
    </div>
  );
}
