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
      `}</style>

      {/* ── Linke Spalte — Spotlight ── */}
      <div style={{
        width: "55%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4vw 5vw 4vw 6vw",
        position: "relative",
        overflow: "hidden",
      }}>
        {spotlight ? (
          <>
            {/* Amber glow */}
            <div style={{
              position: "absolute",
              top: "50%", left: "40%",
              width: "60vw", height: "60vw",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse at center, rgba(232,153,26,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(3rem, 8vw, 6rem)",
              color: A,
              margin: "0 0 0.4rem",
              lineHeight: 1.1,
              position: "relative",
            }}>
              {spotlight.person_name ?? "Gast"}
            </p>

            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: "italic",
              fontSize: "1.2rem",
              color: `rgba(245,232,200,0.70)`,
              margin: "0 0 1.5rem",
              position: "relative",
            }}>
              Willkommen!
            </p>

            {spotlight.lauter_song && (
              <div style={{ position: "relative" }}>
                <p style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: `rgba(232,153,26,0.80)`,
                  lineHeight: 1.6,
                  margin: "0 0 0.2rem",
                }}>
                  ♪ {spotlight.lauter_song}
                </p>
                <p style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.75rem",
                  color: `rgba(245,232,200,0.40)`,
                  margin: 0,
                }}>
                  … sein lautester Song damals
                </p>
              </div>
            )}
          </>
        ) : (
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "2.5rem",
            color: `rgba(232,153,26,0.40)`,
            margin: 0,
            textAlign: "center",
          }}>
            Emmerich boomt.
          </p>
        )}
      </div>

      {/* ── Trennlinie ── */}
      <div style={{ width: "1px", background: "rgba(232,153,26,0.18)", flexShrink: 0 }} />

      {/* ── Rechte Spalte — Wer ist da ── */}
      <div style={{
        width: "45%",
        display: "flex",
        flexDirection: "column",
        padding: "4vw 4vw 3rem 4vw",
        overflow: "hidden",
      }}>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: `rgba(232,153,26,0.60)`,
          margin: "0 0 1.2rem",
          flexShrink: 0,
        }}>
          Schon da
        </p>

        {anwesende.length === 0 ? (
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: `rgba(245,232,200,0.30)`,
            margin: 0,
          }}>
            Noch niemand eingescannt.
          </p>
        ) : (
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{
              animation: shouldScroll ? `tscroll ${scrollDuration} linear infinite` : "none",
            }}>
              {listItems.map((a, i) => (
                <div key={i} style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid rgba(232,153,26,0.12)",
                }}>
                  <span style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "1rem",
                    color: `rgba(245,232,200,0.80)`,
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
      }}>
        Zuletzt aktualisiert: {serverTime}
      </p>
    </div>
  );
}
