import { useState, useEffect, useRef } from "react";

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
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const fetchEntries = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Entry[]) => {
        setEntries(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshKey > 0) fetchEntries();
  }, [refreshKey]);

  if (!loaded || entries.length === 0) return null;

  const totalPersonen = entries.reduce((sum, e) => {
    const raw = PERSONEN_LABEL[e.personen] ?? "1";
    return sum + (raw === "5+" ? 5 : parseInt(raw, 10));
  }, 0);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "rgba(20,13,6,0.95)",
        padding: "4rem 1.5rem 4.5rem",
        animation: "fadeInUp 0.7s ease both",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        .promo-hero {
          text-align: center;
          margin-bottom: 3rem;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }
        .promo-label {
          display: inline-block;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1rem;
          opacity: 0.85;
        }
        .promo-count-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .promo-count {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          font-size: clamp(4rem, 14vw, 7rem);
          color: var(--amber);
          line-height: 1;
          text-shadow: 0 0 40px rgba(205,155,65,0.25);
        }
        .promo-count-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: clamp(1rem, 3vw, 1.3rem);
          color: rgba(245,232,200,0.65);
          line-height: 1.4;
          max-width: 14ch;
          text-align: left;
        }
        .promo-count-label strong {
          color: var(--warm);
          font-style: normal;
          font-weight: 700;
        }
        .promo-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
          margin: 2rem auto;
          opacity: 0.4;
        }
        .teilnehmer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.75rem;
          max-width: 880px;
          margin: 0 auto;
        }
        .teilnehmer-card {
          background: rgba(245,232,200,0.04);
          border: 1px solid rgba(245,232,200,0.07);
          border-radius: 4px;
          padding: 0.9rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: border-color 0.2s;
        }
        .teilnehmer-card:hover {
          border-color: rgba(232,153,26,0.25);
        }
        .teilnehmer-card-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .teilnehmer-name {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1rem;
          color: var(--warm);
          line-height: 1.2;
        }
        .teilnehmer-personen {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: rgba(245,232,200,0.35);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .teilnehmer-song {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.82rem;
          color: var(--amber);
          opacity: 0.85;
        }
      `}</style>

      <div className="promo-hero">
        <span className="promo-label">Schon dabei</span>
        <div className="promo-count-row">
          <span className="promo-count">{entries.length}</span>
          <span className="promo-count-label">
            {entries.length === 1 ? "Person" : "Personen"} dabei
            {totalPersonen > 0 && (
              <>
                {" "}— mindestens{" "}
                <strong>{totalPersonen}</strong>{" "}
                {totalPersonen === 1 ? "Mensch" : "Leute"} kommen!
              </>
            )}
          </span>
        </div>
      </div>

      <div className="promo-divider" />

      <div className="teilnehmer-grid">
        {entries.map((e) => (
          <div key={e.id} className="teilnehmer-card">
            <div className="teilnehmer-card-top">
              <span className="teilnehmer-name">{e.name}</span>
              <span className="teilnehmer-personen">
                {PERSONEN_LABEL[e.personen] ?? "1"}{" "}
                {(PERSONEN_LABEL[e.personen] ?? "1") === "1" ? "Person" : "Personen"}
              </span>
            </div>
            {e.song && (
              <span className="teilnehmer-song">♪ {e.song}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
