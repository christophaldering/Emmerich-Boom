import { useState, useEffect, useRef } from "react";

interface KaiResponse {
  inhalt: string | null;
  createdAt: string | null;
}

interface Teilnehmer {
  id: number;
  name: string;
  personen: string;
  song: string | null;
  statement: string | null;
}

interface KaIProps {
  refreshSignal?: number;
}

function buildKaiIntro(liste: Teilnehmer[]): string {
  const n = liste.length;
  if (n === 0) {
    return "KaI wartet auf die ersten Anmeldungen.";
  }

  const namen = liste.map((t) => t.name);
  const songs = liste.filter((t) => t.song).map((t) => t.song as string);
  const songHint = songs.length > 0 ? `\u201e${songs[Math.floor(songs.length / 2)]}\u201c` : null;

  let nameStr: string;
  if (n === 1)      nameStr = namen[0];
  else if (n === 2) nameStr = `${namen[0]} und ${namen[1]}`;
  else if (n === 3) nameStr = `${namen[0]}, ${namen[1]} und ${namen[2]}`;
  else              nameStr = `${namen[0]}, ${namen[1]} und ${n - 2} weitere`;

  if (n === 1) {
    return `KaI hat die erste Anmeldung gelesen \u2014 ${namen[0]} ist dabei.${songHint ? ` Musikwunsch: ${songHint}. Eine interessante Wahl.` : " Eine erste Einsch\u00e4tzung hat KaI bereits."}`;
  }
  if (n <= 3) {
    return `KaI hat ${n} Anmeldungen gelesen: ${nameStr}.${songHint ? ` ${songHint} ist mit dabei.` : ""} Der Abend nimmt Form an.`;
  }
  if (n <= 8) {
    return `${n} Anmeldungen. KaI kennt ${nameStr} \u2014 und hat jede Zeile gelesen.${songHint ? ` ${songHint} ist mit dabei, was einiges verspricht.` : ""} Das wird ein Abend.`;
  }
  return `${n} Menschen haben sich angemeldet. KaI hat sie alle gelesen \u2014 jedes Wort, jeden Songwunsch. Jetzt hat KaI eine Meinung.`;
}

export default function KaI({ refreshSignal = 0 }: KaIProps) {
  const [inhalt, setInhalt]           = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(false);
  const [needsFade, setNeedsFade]     = useState(false);
  const [teilnehmer, setTeilnehmer]   = useState<Teilnehmer[]>([]);
  const textRef       = useRef<HTMLParagraphElement>(null);
  const fastPollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownCreatedAt = useRef<string | null>(null);

  const fetchTeilnehmer = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Teilnehmer[]) => setTeilnehmer(d))
      .catch(() => {});
  };

  const fetchLatest = async (): Promise<string | null> => {
    try {
      const res  = await fetch("/api/stimmung", { cache: "no-store" });
      const data: KaiResponse = await res.json();
      if (data.inhalt) {
        if (data.createdAt !== knownCreatedAt.current) {
          knownCreatedAt.current = data.createdAt;
          setInhalt(data.inhalt);
          setExpanded(false);
        }
        return data.createdAt;
      }
    } catch {
    }
    return null;
  };

  useEffect(() => {
    fetchTeilnehmer();
    fetchLatest().finally(() => setLoading(false));
    const slow = setInterval(() => {
      fetchTeilnehmer();
      fetchLatest();
    }, 30000);
    return () => clearInterval(slow);
  }, []);

  useEffect(() => {
    if (inhalt && textRef.current) {
      setNeedsFade(textRef.current.scrollHeight > textRef.current.clientHeight + 4);
    }
  }, [inhalt, expanded]);

  useEffect(() => {
    if (refreshSignal === 0) return;

    fetchTeilnehmer();
    setLoading(true);

    if (fastPollRef.current) clearInterval(fastPollRef.current);

    let attempts = 0;
    const startedAt = knownCreatedAt.current;

    fastPollRef.current = setInterval(async () => {
      attempts++;
      const latest = await fetchLatest();
      setLoading(false);
      if (latest !== startedAt || attempts >= 10) {
        if (fastPollRef.current) clearInterval(fastPollRef.current);
        fastPollRef.current = null;
      }
    }, 2000);

    return () => {
      if (fastPollRef.current) clearInterval(fastPollRef.current);
    };
  }, [refreshSignal]);

  const introText = buildKaiIntro(teilnehmer);

  return (
    <section style={{ background: "var(--bg-section)", padding: "2rem 1.5rem 2.5rem" }}>
      <style>{`
        .kai-box {
          max-width: 640px;
          margin: 0 auto;
          border: 1px solid var(--amber-25);
          border-radius: 4px;
          background: var(--fg-04);
          padding: 1.6rem 1.8rem 1.8rem;
        }
        .kai-label { display:inline-block; font-family:'Lora',serif; font-style:italic; font-size:0.75rem; letter-spacing:0.20em; text-transform:uppercase; color:var(--amber); opacity:0.75; margin-bottom:0.5rem; }
        .kai-byline { font-family:'Lora',serif; font-style:italic; font-size:0.88rem; color:var(--fg-45); margin-bottom:0.5rem; line-height:1.6; }
        .kai-dynamic-intro { font-family:'Lora',serif; font-size:1rem; line-height:1.85; color:var(--fg-80); margin-bottom:1.4rem; }
        .kai-result-wrap { position:relative; margin-bottom:0.5rem; }
        .kai-text { font-family:'Lora',serif; font-size:1rem; line-height:1.9; color:var(--fg-90); margin:0; overflow:hidden; transition:max-height 0.4s ease; }
        .kai-text.collapsed { max-height:calc(1.85em * 4); }
        .kai-text.expanded-text { max-height:40em; }
        .kai-fade { position:absolute; bottom:0; left:0; right:0; height:3em; background:linear-gradient(to bottom, transparent, var(--bg-section)); pointer-events:none; }
        .kai-read-more { background:none; border:none; cursor:pointer; padding:0.4rem 0 0; font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--amber-75); transition:color 0.2s; display:block; }
        .kai-read-more:hover { color:var(--amber); }
        .kai-loading { font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--fg-45); }
      `}</style>

      <div className="kai-box">
        <span className="kai-label">KaI</span>
        <p className="kai-byline">
          KaI ist das KI-System des Entwicklerteams — und liest seit Beginn sehr aufmerksam mit.
        </p>
        <p className="kai-dynamic-intro">{introText}</p>

        {loading && !inhalt && (
          <p className="kai-loading">KaI liest gerade …</p>
        )}

        {inhalt && (
          <div className="kai-result-wrap">
            <p
              ref={textRef}
              className={`kai-text ${expanded ? "expanded-text" : "collapsed"}`}
            >
              {inhalt}
            </p>
            {!expanded && needsFade && <div className="kai-fade" />}
            {needsFade && (
              <button className="kai-read-more" onClick={() => setExpanded(v => !v)}>
                {expanded ? "weniger anzeigen ▲" : "vollständig lesen ▼"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
