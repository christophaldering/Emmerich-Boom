import { useState, useEffect } from "react";

type Entry = {
  id: number;
  name: string;
  personen: string;
  song: string | null;
  statement: string | null;
  createdAt: string | null;
};

const PERSONEN_SHORT: Record<string, string> = {
  "Nur ich":              "1 Person",
  "Wir zwei":             "2 Personen",
  "Wir drei":             "3 Personen",
  "Vier auf einen Streich": "4 Personen",
  "Fünf oder mehr":       "5+ Personen",
};

const PERSONEN_COUNT: Record<string, number> = {
  "Nur ich": 1, "Wir zwei": 2, "Wir drei": 3,
  "Vier auf einen Streich": 4, "Fünf oder mehr": 5,
};

function toInitials(raw: string): string {
  let s = raw.trim();
  if (s.includes("@")) {
    s = s.split("@")[0];
  }
  s = s.replace(/\d+$/, "");
  const segments = s.split(/[.\-_\s]+/).filter(Boolean);
  const initials = segments.slice(0, 3).map((seg) => seg[0].toUpperCase());
  return initials.join(".") + ".";
}

interface TeilnehmerProps {
  refreshKey?: number;
}


export default function Teilnehmer({ refreshKey = 0 }: TeilnehmerProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded]   = useState(false);
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

  const totalPersonen = entries.reduce(
    (sum, e) => sum + (PERSONEN_COUNT[e.personen] ?? 1), 0
  );

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
        {totalPersonen > entries.length ? (
          <div className="promo-count-row">
            <div className="promo-stat">
              <span className="promo-count promo-count--amber">{entries.length}</span>
              <span className="promo-count-label">{entries.length === 1 ? "Boomer hat" : "Boomer haben"}</span>
            </div>
            <div className="promo-stat">
              <span className="promo-count promo-count--warm">{totalPersonen}</span>
              <span className="promo-count-label">Personen angemeldet</span>
            </div>
          </div>
        ) : (
          <div className="promo-count-row">
            <div className="promo-stat">
              <span className="promo-count promo-count--amber">{entries.length}</span>
              <span className="promo-count-label">
                {entries.length === 1 ? "Boomer hat sich gemeldet" : "Boomer haben Interesse bekundet"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="tn-list">
        {visible.map((e) => {
          const persons  = PERSONEN_SHORT[e.personen] ?? "1 Person";
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
