import { useState, useEffect } from "react";

const PERSONEN_COUNT: Record<string, number> = {
  "Nur ich": 1, "Wir zwei": 2, "Wir drei": 3,
  "Vier auf einen Streich": 4, "Fünf oder mehr": 5,
};

function todayDe(): string {
  return new Date().toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

interface Props { refreshKey?: number; }

export default function AnmeldungsZaehler({ refreshKey = 0 }: Props) {
  const [anmeldungen, setAnmeldungen] = useState<number | null>(null);
  const [personen,    setPersonen]    = useState<number | null>(null);

  const load = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { personen: string }[]) => {
        setAnmeldungen(data.length);
        setPersonen(data.reduce((s, e) => s + (PERSONEN_COUNT[e.personen] ?? 1), 0));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (refreshKey > 0) load(); }, [refreshKey]);

  if (anmeldungen === null || anmeldungen === 0) return null;

  const datum = todayDe();

  return (
    <div style={{
      background: "var(--bg-section)",
      padding: "1.1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        maxWidth: "640px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "1.2rem",
        padding: "0.85rem 1.2rem",
        background: "var(--amber-08)",
        border: "1px solid var(--amber-25)",
        borderRadius: "4px",
      }}>
        {/* Datum */}
        <div style={{ flex: "0 0 auto" }}>
          <span style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-45)",
          }}>
            {datum}
          </span>
        </div>

        {/* Trennlinie */}
        <div style={{ flex: 1, height: "1px", background: "var(--amber-20)" }} />

        {/* Zahlen */}
        <div style={{ flex: "0 0 auto", display: "flex", gap: "0.6rem", alignItems: "baseline" }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1.45rem",
            color: "var(--amber)",
            lineHeight: 1,
          }}>
            {personen}
          </span>
          <span style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.82rem",
            color: "var(--fg-45)",
          }}>
            {personen === 1 ? "Person" : "Personen"} dabei
          </span>
        </div>
      </div>
    </div>
  );
}
