import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const BG  = "#0A0704";
const A   = "#E8991A";
const FG  = "#F5E8C8";

type Neuankoemmling = {
  id: number;
  person_name: string | null;
  scanned_at: string;
  lauter_song: string | null;
};

type Anwesender = {
  person_name: string | null;
  eingelassen_am: string | null;
};

type TafelData = {
  neuankoemmlinge: Neuankoemmling[];
  anwesende: Anwesender[];
  server_time: string;
};

export default function TafelPage() {
  const [data, setData] = useState<TafelData | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = () => {
    fetch(`${BASE}/api/tafel`)
      .then(r => r.ok ? r.json() : null)
      .then((d: TafelData | null) => { if (d) setData(d); })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 5_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const neuankoemmlinge = data?.neuankoemmlinge ?? [];
  const anwesende       = data?.anwesende ?? [];
  const spotlight       = neuankoemmlinge[0] ?? null;
  const serverTime      = data?.server_time
    ? new Date(data.server_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  const scrollDuration = Math.max(8, anwesende.length * 1.8) + "s";
  const shouldScroll   = anwesende.length >= 6;
  const listItems      = shouldScroll ? [...anwesende, ...anwesende] : anwesende;

  return (
    <div style={{
      width: "100vw", height: "100svh",
      background: BG,
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes tscroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes tafelpuls {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>

      {/* ── Linke Spalte — Spotlight ── */}
      <div style={{
        width: "55%",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Poster-Hintergrund */}
        <div style={{
          position: "absolute", inset: 0,
          background: "url(/images/boomerpartyposter.jpeg) center center / cover no-repeat",
        }} />
        {/* Gradient-Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,7,4,0.15) 0%, rgba(10,7,4,0.55) 60%, rgba(10,7,4,0.92) 100%)",
        }} />

        {spotlight ? (
          <>
            {/* Amber Glow hinter Content */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 70%, rgba(232,153,26,0.18) 0%, transparent 65%)",
            }} />

            {/* Content-Block */}
            <div style={{
              position: "absolute",
              bottom: "20%", left: "5%", right: "5%",
              zIndex: 1,
            }}>
              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: `rgba(232,153,26,0.70)`,
                margin: "0 0 1rem",
              }}>
                Gerade angekommen
              </p>

              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                color: FG,
                lineHeight: 1.1,
                margin: 0,
                textShadow: "0 2px 20px rgba(0,0,0,0.9)",
              }}>
                {spotlight.person_name ?? "Gast"}
              </p>

              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: A,
                margin: "0.75rem 0 0",
              }}>
                Herzlich willkommen!
              </p>

              {spotlight.lauter_song && (
                <div style={{ marginTop: "1.25rem" }}>
                  <p style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "1.1rem",
                    color: `rgba(245,232,200,0.80)`,
                    margin: 0,
                  }}>
                    ♪ {spotlight.lauter_song}
                  </p>
                  <p style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "0.72rem",
                    color: `rgba(245,232,200,0.38)`,
                    margin: "0.3rem 0 0",
                  }}>
                    … sein lautester Song damals
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Idle-State: nur Datum unten */
          <div style={{
            position: "absolute",
            bottom: "2.5rem", left: 0, right: 0,
            textAlign: "center",
            zIndex: 1,
          }}>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: `rgba(245,232,200,0.45)`,
              margin: 0,
            }}>
              18. Juli 2026 · Bölt · Kapaunenberg
            </p>
          </div>
        )}
      </div>

      {/* ── Trennlinie ── */}
      <div style={{ width: "1px", background: "rgba(232,153,26,0.18)", flexShrink: 0 }} />

      {/* ── Rechte Spalte — Schon da ── */}
      <div style={{
        width: "45%",
        display: "flex",
        flexDirection: "column",
        padding: "4vw 4vw 3rem 4vw",
        overflow: "hidden",
        background: "linear-gradient(to bottom, rgba(232,153,26,0.04) 0%, rgba(10,7,4,0) 100%)",
      }}>
        {/* Überschrift */}
        <div style={{ flexShrink: 0, marginBottom: "1.2rem" }}>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1.4rem",
            color: A,
            margin: "0 0 0.25rem",
          }}>
            Schon da
          </p>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: anwesende.length === 0 ? "italic" : "normal",
            fontSize: "0.78rem",
            color: anwesende.length === 0
              ? `rgba(245,232,200,0.35)`
              : `rgba(245,232,200,0.40)`,
            margin: 0,
          }}>
            {anwesende.length === 0
              ? "Wir warten auf euch …"
              : `${anwesende.length} ${anwesende.length === 1 ? "Person" : "Personen"}`}
          </p>
        </div>

        {anwesende.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "3rem", opacity: 0.35 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: FG,
              lineHeight: 1.6,
              margin: 0,
            }}>
              Gleich geht's los.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{
              animation: shouldScroll ? `tscroll ${scrollDuration} linear infinite` : "none",
            }}>
              {listItems.map((a, i) => (
                <div key={i} style={{
                  padding: "0.55rem 0 0.55rem 0.75rem",
                  borderLeft: "2px solid rgba(232,153,26,0.2)",
                  marginBottom: "0.25rem",
                }}>
                  <span style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "0.95rem",
                    color: `rgba(245,232,200,0.85)`,
                  }}>
                    {a.person_name ?? "Gast"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Status unten rechts ── */}
      <p style={{
        position: "absolute",
        bottom: "0.75rem",
        right: "1rem",
        fontFamily: "'Lora', Georgia, serif",
        fontSize: "0.65rem",
        color: `rgba(245,232,200,0.25)`,
        margin: 0,
        display: "flex",
        alignItems: "center",
      }}>
        <span style={{
          display: "inline-block",
          width: "6px", height: "6px",
          borderRadius: "50%",
          background: A,
          marginRight: "0.4rem",
          animation: "tafelpuls 2.5s ease-in-out infinite",
          verticalAlign: "middle",
          flexShrink: 0,
        }} />
        Zuletzt aktualisiert: {serverTime}
      </p>
    </div>
  );
}
