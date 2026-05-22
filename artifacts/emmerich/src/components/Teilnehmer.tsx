import { useState, useEffect } from "react";
import { toInitials } from "../utils/toInitials";

type Entry = {
  id: string | number;
  name: string;
  personen?: string | null;
  song?: string | null;
  statement?: string | null;
  createdAt?: string | null;
};

type InteresseStats = {
  boomer: number;
  personen: number;
};

type InteresseResponse = {
  stats: InteresseStats;
  entries: Entry[];
};

const PERSONEN_SHORT: Record<string, string> = {
  "Nur ich":              "1 Person",
  "Wir zwei":             "2 Personen",
  "Wir drei":             "3 Personen",
  "Vier auf einen Streich": "4 Personen",
  "Fünf oder mehr":       "5+ Personen",
};


interface TeilnehmerProps {
  refreshKey?: number;
}


export default function Teilnehmer({ refreshKey = 0 }: TeilnehmerProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats]     = useState<InteresseStats>({ boomer: 0, personen: 0 });
  const [loaded, setLoaded]   = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchEntries = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: InteresseResponse) => {
        setStats(data.stats);
        setEntries(data.entries);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  };

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (refreshKey > 0) fetchEntries(); }, [refreshKey]);

  if (!loaded || stats.boomer === 0) return null;

  const totalPersonen = stats.personen;
  const boomerCount   = stats.boomer;

  const SHOW_LIMIT = 8;
  const visible = showAll ? entries : entries.slice(0, SHOW_LIMIT);
  const hidden  = entries.length - SHOW_LIMIT;

  return (
    <section style={{ background: "var(--bg-section)", padding: "2.5rem 1.5rem 2rem", animation: "fadeInUp 0.7s ease both" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }

        .promo-hero { text-align:center; margin-bottom:2rem; max-width:700px; margin-left:auto; margin-right:auto; }
        .promo-label { display:inline-block; font-family:'Lora',serif; font-style:italic; font-size:0.78rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--amber); margin-bottom:0.8rem; opacity:0.85; }
        .promo-count-row { display:flex; align-items:center; justify-content:center; gap:2.5rem; flex-wrap:wrap; }
        .promo-stat { display:flex; flex-direction:column; align-items:center; gap:0.25rem; }
        .promo-count { font-family:'Playfair Display',serif; font-weight:800; font-size:clamp(4rem,14vw,7rem); line-height:1; text-shadow:0 0 40px rgba(205,155,65,0.25); }
        .promo-count--amber { color:var(--amber); }
        .promo-count--warm  { color:var(--warm); }
        .promo-count-label { font-family:'Lora',serif; font-style:italic; font-size:clamp(0.8rem,2.5vw,1rem); color:var(--fg-65); line-height:1.3; text-align:center; }

        .tn-list { max-width:640px; margin:0 auto; border-top:1px solid var(--fg-08); }

        .tn-row { border-bottom:1px solid var(--fg-06); padding:0.45rem 0.5rem 0.4rem; }
        .tn-row:hover { background:var(--fg-03); }

        .tn-row-header { display:flex; justify-content:space-between; align-items:baseline; gap:0.6rem; }
        .tn-row-name { font-family:'Courier New',Courier,monospace; font-size:0.9rem; font-weight:700; color:var(--warm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
        .tn-row-persons { font-family:'Courier New',Courier,monospace; font-size:0.75rem; color:var(--fg-65); white-space:nowrap; flex-shrink:0; }

        .tn-row-stmt { font-family:'Courier New',Courier,monospace; font-size:0.8rem; color:var(--fg-85); margin-top:0.12rem; word-break:break-word; overflow-wrap:anywhere; }
        .tn-row-song { font-family:'Courier New',Courier,monospace; font-size:0.78rem; color:var(--fg-80); margin-top:0.1rem; word-break:break-word; overflow-wrap:anywhere; }

        .tn-expand { display:block; font-family:'Courier New',Courier,monospace; font-size:0.8rem; color:var(--amber-60); background:none; border:none; cursor:pointer; padding:0.5rem 0.5rem 0; text-align:left; }
        .tn-expand:hover { color:var(--amber); }
      `}</style>

      <div className="promo-hero">
        <span className="promo-label">Interesse bekundet</span>
        {totalPersonen > boomerCount ? (
          <div className="promo-count-row">
            <div className="promo-stat">
              <span className="promo-count promo-count--amber">{boomerCount}</span>
              <span className="promo-count-label">{boomerCount === 1 ? "Boomer hat" : "Boomer haben"}</span>
            </div>
            <div className="promo-stat">
              <span className="promo-count promo-count--warm">{totalPersonen}</span>
              <span className="promo-count-label">Personen angemeldet</span>
            </div>
          </div>
        ) : (
          <div className="promo-count-row">
            <div className="promo-stat">
              <span className="promo-count promo-count--amber">{boomerCount}</span>
              <span className="promo-count-label">
                {boomerCount === 1 ? "Boomer hat sich gemeldet" : "Boomer haben Interesse bekundet"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="tn-list">
        {visible.map((e) => {
          const persons  = e.personen ? (PERSONEN_SHORT[e.personen] ?? e.personen) : null;
          const hasStmt  = !!e.statement;
          const hasSong  = !!e.song;

          return (
            <div key={e.id} className="tn-row">
              <div className="tn-row-header">
                <span className="tn-row-name">{toInitials(e.name)}</span>
                <span className="tn-row-persons">{persons}</span>
              </div>
              {hasStmt && (
                <div className="tn-row-stmt">„{e.statement}"</div>
              )}
              {hasSong && (
                <div className="tn-row-song">♪ {e.song}</div>
              )}
            </div>
          );
        })}
        {!showAll && hidden > 0 && (
          <button className="tn-expand" onClick={() => setShowAll(true)}>
            + {hidden} weitere …
          </button>
        )}
      </div>
    </section>
  );
}
