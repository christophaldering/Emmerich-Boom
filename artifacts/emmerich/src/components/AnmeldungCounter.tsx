import { useGetAnmeldungStats } from "@workspace/api-client-react";

export default function AnmeldungCounter() {
  const { data } = useGetAnmeldungStats();
  const anzahl = data?.angemeldete_personen ?? 0;

  if (anzahl < 1) return null;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 2rem 0",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
          color: "var(--amber)",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        Schon dabei: {anzahl} {anzahl === 1 ? "Person" : "Personen"}
      </p>
    </div>
  );
}
