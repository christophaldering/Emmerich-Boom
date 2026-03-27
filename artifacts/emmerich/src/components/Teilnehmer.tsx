import { useState, useEffect, useRef } from "react";

type Entry = {
  id: number;
  name: string;
  personen: string;
  song: string | null;
  statement: string | null;
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

const FEATURED = 3;

export default function Teilnehmer({ refreshKey = 0 }: TeilnehmerProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchEntries = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Entry[]) => { setEntries(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (refreshKey > 0) fetchEntries(); }, [refreshKey]);

  if (!loaded || entries.length === 0) return null;

  const totalPersonen = entries.reduce((sum, e) => {
    const raw = PERSONEN_LABEL[e.personen] ?? "1";
    return sum + (raw === "5+" ? 5 : parseInt(raw, 10));
  }, 0);

  // Newest first; first FEATURED get full cards
  const featured = entries.slice(0, FEATURED);
  const rest     = entries.slice(FEATURED);

  return (
    <section style={{ background: "rgba(20,13,6,0.95)", padding: "4rem 1.5rem 4.5rem", animation: "fadeInUp 0.7s ease both" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .promo-hero { text-align:center; margin-bottom:3rem; max-width:700px; margin-left:auto; margin-right:auto; }
        .promo-label { display:inline-block; font-family:'Lora',serif; font-style:italic; font-size:0.78rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--amber); margin-bottom:1rem; opacity:0.85; }
        .promo-count-row { display:flex; align-items:baseline; justify-content:center; gap:0.7rem; flex-wrap:wrap; margin-bottom:0.5rem; }
        .promo-count { font-family:'Playfair Display',serif; font-weight:800; font-size:clamp(4rem,14vw,7rem); color:var(--amber); line-height:1; text-shadow:0 0 40px rgba(205,155,65,0.25); }
        .promo-count-label { font-family:'Lora',serif; font-style:italic; font-size:clamp(1rem,3vw,1.3rem); color:rgba(245,232,200,0.88); line-height:1.4; max-width:18ch; text-align:left; }
        .promo-count-label strong { color:var(--warm); font-style:normal; font-weight:700; }
        .promo-divider { width:60px; height:1px; background:linear-gradient(90deg,transparent,var(--amber),transparent); margin:2rem auto; opacity:0.4; }

        .tn-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:0.85rem; max-width:900px; margin:0 auto; }
        .tn-card { background:rgba(245,232,200,0.04); border:1px solid rgba(245,232,200,0.08); border-radius:4px; padding:1rem 1.2rem; display:flex; flex-direction:column; gap:0.45rem; transition:border-color 0.2s; }
        .tn-card:hover { border-color:rgba(232,153,26,0.25); }
        .tn-card-top { display:flex; align-items:baseline; justify-content:space-between; gap:0.5rem; }
        .tn-name { font-family:'Playfair Display',serif; font-weight:700; font-size:1.05rem; color:var(--warm); line-height:1.2; }
        .tn-personen { font-family:'Lora',serif; font-style:italic; font-size:0.9rem; color:rgba(245,232,200,0.65); white-space:nowrap; flex-shrink:0; }
        .tn-statement { font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:rgba(245,232,200,0.85); line-height:1.65; border-left:2px solid rgba(232,153,26,0.2); padding-left:0.7rem; margin-top:0.1rem; }
        .tn-song { font-family:'Lora',serif; font-style:italic; font-size:0.82rem; color:var(--amber); opacity:0.85; margin-top:0.1rem; }

        .tn-rest { max-width:900px; margin:2rem auto 0; }
        .tn-rest-label { font-family:'Lora',serif; font-style:italic; font-size:0.78rem; letter-spacing:0.18em; text-transform:uppercase; color:rgba(232,153,26,0.55); margin-bottom:1rem; }
        .tn-chips { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .tn-chip { font-family:'Lora',serif; font-size:0.9rem; color:rgba(245,232,200,0.75); background:rgba(245,232,200,0.05); border:1px solid rgba(245,232,200,0.09); border-radius:2px; padding:0.3rem 0.7rem; line-height:1.3; }
        .tn-chip-personen { font-size:0.72rem; color:rgba(232,153,26,0.6); margin-left:0.3rem; }

        .tn-expand { background:none; border:none; font-family:'Lora',serif; font-style:italic; font-size:0.85rem; color:rgba(232,153,26,0.6); cursor:pointer; padding:0; margin-top:1.2rem; display:block; text-align:left; text-decoration:underline; text-underline-offset:3px; }
        .tn-expand:hover { color:var(--amber); }

        .tn-ticker { max-width:900px; margin:2rem auto 0; overflow:hidden; }
        .tn-ticker-inner { display:flex; flex-wrap:wrap; gap:0.5rem; }
      `}</style>

      <div className="promo-hero">
        <span className="promo-label">bereits gemeldet</span>
        <div className="promo-count-row">
          <span className="promo-count">{entries.length}</span>
          <span className="promo-count-label">
            mit Boomer-Feeling dabei{totalPersonen > 0 && (<> — macht <strong>mindestens {totalPersonen}</strong> {totalPersonen === 1 ? "Mensch" : "Leute"} von der richtigen Sorte.</>)}
          </span>
        </div>
      </div>

      <div className="promo-divider" />

      {/* 3 featured full cards */}
      <div className="tn-grid">
        {featured.map((e) => {
          const p = PERSONEN_LABEL[e.personen] ?? "1";
          return (
            <div key={e.id} className="tn-card">
              <div className="tn-card-top">
                <span className="tn-name">{e.name}</span>
                <span className="tn-personen">{p} {p === "1" ? "Person" : "Personen"}</span>
              </div>
              {e.statement && <p className="tn-statement">„{e.statement}"</p>}
              {e.song && <span className="tn-song">♪ {e.song}</span>}
            </div>
          );
        })}
      </div>

      {/* Remaining: compact chips */}
      {rest.length > 0 && (
        <div className="tn-rest">
          <p className="tn-rest-label">Außerdem dabei</p>
          <div className="tn-chips">
            {(showAll ? rest : rest.slice(0, 12)).map((e) => {
              const p = PERSONEN_LABEL[e.personen] ?? "1";
              return (
                <span key={e.id} className="tn-chip">
                  {e.name}
                  {p !== "1" && <span className="tn-chip-personen">×{p}</span>}
                </span>
              );
            })}
            {!showAll && rest.length > 12 && (
              <button className="tn-expand" onClick={() => setShowAll(true)}>
                + {rest.length - 12} weitere …
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
