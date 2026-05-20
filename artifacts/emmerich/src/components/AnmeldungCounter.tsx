import {
  useGetAnmeldungStats,
  useGetInteressentenCount,
  getGetAnmeldungStatsQueryKey,
  getGetInteressentenCountQueryKey,
} from "@workspace/api-client-react";

export default function AnmeldungCounter() {
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });
  const { data: interesData } = useGetInteressentenCount({
    query: { queryKey: getGetInteressentenCountQueryKey(), refetchInterval: 60000 },
  });

  const angemeldete = statsData?.angemeldete_personen ?? 0;
  const interessenten = interesData?.count ?? 0;

  if (angemeldete < 1 && interessenten < 1) return null;

  return (
    <div style={{ padding: "2.5rem 2rem 0", maxWidth: "640px", margin: "0 auto" }}>
      <p
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          lineHeight: 1.85,
          color: "var(--fg-80)",
          margin: 0,
        }}
      >
        {interessenten > 0 && angemeldete > 0 ? (
          <>
            Von den{" "}
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "var(--amber)", fontSize: "1.1em" }}>
              {interessenten}
            </span>{" "}
            Interessenten haben sich bereits{" "}
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "var(--warm)", fontSize: "1.1em" }}>
              {angemeldete}
            </span>{" "}
            Personen verbindlich angemeldet — da geht noch was.{" "}
            Gebt es gerne in euren Netzwerken weiter: die Anmeldung ist freigeschaltet.
          </>
        ) : angemeldete > 0 ? (
          <>
            Bereits{" "}
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "var(--amber)", fontSize: "1.1em" }}>
              {angemeldete}
            </span>{" "}
            {angemeldete === 1 ? "Person hat" : "Personen haben"} sich verbindlich angemeldet.{" "}
            Gebt es gerne weiter: die Anmeldung ist freigeschaltet.
          </>
        ) : (
          <>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "var(--amber)", fontSize: "1.1em" }}>
              {interessenten}
            </span>{" "}
            {interessenten === 1 ? "Person hat" : "Personen haben"} Interesse signalisiert.{" "}
            Gebt es gerne weiter — die verbindliche Anmeldung ist freigeschaltet.
          </>
        )}
      </p>
    </div>
  );
}
