import { useReveal } from "@/hooks/useReveal";
import { useGetAnmeldungStats, getGetAnmeldungStatsQueryKey } from "@workspace/api-client-react";

export default function AnmeldungBrief() {
  const ref = useReveal();
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });
  const angemeldete = statsData?.angemeldete_personen ?? null;

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "6rem 2rem 5rem" }}
    >
      <h2
        className="reveal d1"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          lineHeight: 1.2,
          color: "var(--warm)",
          marginBottom: "2rem",
        }}
      >
        {angemeldete != null ? `${angemeldete} Boomer dabei.` : "Schon viele dabei."}{" "}
        Und du fehlst noch.
      </h2>

      <div className="reveal d2">
        <style>{`
          .anmeldung-brief p {
            font-family: 'Lora', serif;
            font-size: clamp(1rem, 2.2vw, 1.12rem);
            line-height: 1.9;
            color: var(--fg-90);
            margin-bottom: 1.4em;
          }
        `}</style>
        <div className="anmeldung-brief">
          <p>
            Emmerich, 18. Juli 2026 — das wird eine Party für Leute, die wissen, was
            eine gute Party ist. Musik, die man noch auswendig kann. Gesichter, die man
            vielleicht lange nicht gesehen hat. Und Abende, die besser werden, je später
            es wird.
          </p>
          <p>
            Die Anmeldung ist einfach: Name, Mailadresse, zehn Euro pro Person — fertig.
            Die Tickets kommen per Mail, die Zahlung läuft per Überweisung oder PayPal.
            Anmeldeschluss ist der <strong style={{ color: "var(--warm)" }}>30. Juni 2026</strong>.
          </p>
          <p>
            Wer jetzt noch nicht dabei ist, verpasst etwas. Das sagen nicht wir — das
            sagen die {angemeldete != null ? angemeldete : "vielen"} Leute, die schon
            angemeldet sind.
          </p>
        </div>
      </div>
    </section>
  );
}
