import { useState, useEffect, useRef } from "react";

interface KaiResponse {
  inhalt: string | null;
  createdAt: string | null;
}

interface KaIProps {
  refreshSignal?: number;
}

export default function KaI({ refreshSignal = 0 }: KaIProps) {
  const [inhalt, setInhalt]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(false);
  const [needsFade, setNeedsFade] = useState(false);
  const textRef    = useRef<HTMLParagraphElement>(null);
  const fastPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownCreatedAt = useRef<string | null>(null);

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
    fetchLatest().finally(() => setLoading(false));
    const slow = setInterval(fetchLatest, 30000);
    return () => clearInterval(slow);
  }, []);

  useEffect(() => {
    if (inhalt && textRef.current) {
      setNeedsFade(textRef.current.scrollHeight > textRef.current.clientHeight + 4);
    }
  }, [inhalt, expanded]);

  useEffect(() => {
    if (refreshSignal === 0) return;

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

  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 3.5rem" }}>
      <style>{`
        .kai-label { display:inline-block; font-family:'Lora',serif; font-style:italic; font-size:0.75rem; letter-spacing:0.20em; text-transform:uppercase; color:var(--amber); opacity:0.75; margin-bottom:0.5rem; }
        .kai-intro { font-family:'Lora',serif; font-style:italic; font-size:0.88rem; color:var(--fg-55); margin-bottom:1.2rem; line-height:1.6; }
        .kai-result-wrap { position:relative; margin-bottom:0.5rem; }
        .kai-text { font-family:'Lora',serif; font-size:1rem; line-height:1.9; color:var(--fg-90); margin:0; overflow:hidden; transition:max-height 0.4s ease; }
        .kai-text.collapsed { max-height:calc(1.85em * 4); }
        .kai-text.expanded-text { max-height:40em; }
        .kai-fade { position:absolute; bottom:0; left:0; right:0; height:3em; background:linear-gradient(to bottom, transparent, var(--bg-page)); pointer-events:none; }
        .kai-read-more { background:none; border:none; cursor:pointer; padding:0.4rem 0 0; font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--amber-75); transition:color 0.2s; display:block; }
        .kai-read-more:hover { color:var(--amber); }
        .kai-loading { font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--fg-45); }
        .kai-empty { font-family:'Lora',serif; font-style:italic; font-size:0.95rem; color:var(--fg-40); }
      `}</style>

      <span className="kai-label">KaI</span>
      <p className="kai-intro">
        KaI ist das KI-System des Entwicklerteams — und liest seit Beginn sehr aufmerksam mit.
      </p>

      {loading && !inhalt && (
        <p className="kai-loading">KaI liest gerade …</p>
      )}

      {!loading && !inhalt && (
        <p className="kai-empty">KaI wartet auf die ersten Anmeldungen.</p>
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
    </section>
  );
}
