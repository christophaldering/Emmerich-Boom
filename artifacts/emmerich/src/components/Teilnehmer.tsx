import { useState, useEffect } from "react";
import { useReveal } from "@/hooks/useReveal";

type Entry = {
  id: number;
  name: string;
  personen: string;
  song: string | null;
  createdAt: string | null;
};

const PERSONEN_LABEL: Record<string, string> = {
  "Nur ich": "1",
  "Wir zwei": "2",
  "Wir drei": "3",
  "Vier auf einen Streich": "4",
  "Fünf oder mehr": "5+",
};

interface TeilnehmerProps {
  refreshKey?: number;
}

export default function Teilnehmer({ refreshKey = 0 }: TeilnehmerProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const ref = useReveal();

  const fetchEntries = () => {
    fetch("/api/interesse")
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchEntries();
    }
  }, [refreshKey]);

  const totalPersonen = entries.reduce((sum, e) => {
    const raw = PERSONEN_LABEL[e.personen] ?? "1";
    return sum + (raw === "5+" ? 5 : parseInt(raw, 10));
  }, 0);

  if (entries.length === 0) return null;

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 5rem" }}
    >
      <style>{`
        .teilnehmer-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.5rem 1rem;
          align-items: baseline;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(245,232,200,0.06);
        }
        .teilnehmer-name {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1rem;
          color: var(--warm);
        }
        .teilnehmer-personen {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.78rem;
          color: rgba(245,232,200,0.35);
          white-space: nowrap;
        }
        .teilnehmer-song {
          grid-column: 1 / -1;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.85rem;
          color: var(--amber);
          padding-left: 0.2rem;
        }
      `}</style>

      <div className="reveal" style={{ marginBottom: "1.8rem" }}>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--amber)",
            marginBottom: "0.6rem",
          }}
        >
          Wer ist schon dabei
        </p>

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem,7vw,4rem)",
              color: "var(--amber)",
              lineHeight: 1,
            }}
          >
            {entries.length}
          </span>
          <span
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "rgba(245,232,200,0.55)",
            }}
          >
            {entries.length === 1 ? "Person hat" : "Personen haben"} Daumen hoch gegeben
            {totalPersonen > entries.length && (
              <> — das sind mindestens <strong style={{ color: "var(--warm)", fontStyle: "normal" }}>{totalPersonen}</strong> Leute</>
            )}
          </span>
        </div>
      </div>

      <div className="reveal d1">
        {entries.map((e) => (
          <div key={e.id} className="teilnehmer-item">
            <span className="teilnehmer-name">{e.name}</span>
            <span className="teilnehmer-personen">
              {PERSONEN_LABEL[e.personen] ?? "1"} {(PERSONEN_LABEL[e.personen] ?? "1") === "1" ? "Person" : "Personen"}
            </span>
            {e.song && (
              <span className="teilnehmer-song">♪ {e.song}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
