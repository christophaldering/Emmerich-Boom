import { useEffect, useState, useRef, useCallback } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const A = "#E8991A";
const BG = "#0A0704";

interface FeedEntry {
  id: number;
  anmeldung_ticket_id: number;
  anzeige_name: string;
  vorstellung?: string;
  f_tontraeger?: string;
  f_abends?: string;
  f_untersatz?: string;
  f_musik?: string;
  f_getraenk?: string;
  lauter_song?: string;
  foto_frueher_key?: string;
  foto_frueher_jahr?: number;
  foto_heute_key?: string;
  foto_heute_jahr?: number;
  fotos: { id: number; datei_key: string; bildunterschrift?: string; jahr?: number }[];
  hat_botschaft: boolean;
  sichtbarkeit_zugestimmt_am: string;
}

function fotoUrl(key: string, token: string) {
  return `${BASE}/api/theke/datei/${key}?t=${encodeURIComponent(token)}`;
}

function noindex() {
  let meta = document.head.querySelector<HTMLMetaElement>("meta[name='robots'][data-theke]");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "robots";
    meta.setAttribute("data-theke", "1");
    document.head.appendChild(meta);
  }
  meta.content = "noindex,nofollow";
}
function removeNoindex() {
  document.head.querySelector("meta[name='robots'][data-theke]")?.remove();
}

export default function ThekeWandPage() {
  const [token, setToken] = useState<string | null>(null);
  const [zugangFehler, setZugangFehler] = useState(false);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    noindex();
    return () => removeNoindex();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (!t || t.length !== 16) { setZugangFehler(true); return; }
    setToken(t.toUpperCase());
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/api/theke/feed`, { headers: { "x-theke-token": token } })
      .then(r => r.json())
      .then((data: FeedEntry[]) => {
        const withFotos = data.filter(p => p.foto_frueher_key || p.foto_heute_key || p.fotos.length > 0);
        setFeed(withFotos);
      })
      .catch(() => {});
  }, [token]);

  const next = useCallback(() => {
    if (feed.length <= 1) return;
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + 1) % feed.length);
      setFading(false);
    }, 800);
  }, [feed.length]);

  useEffect(() => {
    if (feed.length === 0) return;
    timerRef.current = setInterval(next, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [feed.length, next]);

  if (zugangFehler) {
    return (
      <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.5)" }}>Kein gültiger Zugang.</p>
      </div>
    );
  }

  if (!token || feed.length === 0) {
    return (
      <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: A, opacity: 0.6 }}>
          Die Theke füllt sich …
        </div>
      </div>
    );
  }

  const entry = feed[idx % feed.length]!;

  return (
    <div style={{ background: BG, width: "100vw", height: "100svh", overflow: "hidden", position: "relative" }}>
      <style>{`
        .wand-card { transition: opacity 0.8s ease; }
        .wand-card.fading { opacity: 0; }
        .wand-card.visible { opacity: 1; }
      `}</style>

      <div className={`wand-card ${fading ? "fading" : "visible"}`} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: entry.foto_frueher_key && entry.foto_heute_key ? "1fr 1fr" : "1fr", gap: 0 }}>
          {entry.foto_frueher_key && (
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={fotoUrl(entry.foto_frueher_key, token!)}
                alt="Früher"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.7) 0%, transparent 50%)" }} />
              {entry.foto_frueher_jahr && (
                <div style={{
                  position: "absolute", bottom: "1.5rem", left: "1.5rem",
                  fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700,
                  fontSize: "clamp(2rem, 5vw, 4rem)", color: A,
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                }}>
                  {entry.foto_frueher_jahr}
                </div>
              )}
              <div style={{ position: "absolute", top: "1rem", left: "1rem", fontFamily: "'Lora', serif", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,232,200,0.5)" }}>
                Früher
              </div>
            </div>
          )}
          {entry.foto_heute_key && (
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={fotoUrl(entry.foto_heute_key, token!)}
                alt="Heute"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.7) 0%, transparent 50%)" }} />
              {entry.foto_heute_jahr && (
                <div style={{
                  position: "absolute", bottom: "1.5rem", left: "1.5rem",
                  fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700,
                  fontSize: "clamp(2rem, 5vw, 4rem)", color: A,
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                }}>
                  {entry.foto_heute_jahr}
                </div>
              )}
              <div style={{ position: "absolute", top: "1rem", left: "1rem", fontFamily: "'Lora', serif", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,232,200,0.5)" }}>
                Heute
              </div>
            </div>
          )}
          {!entry.foto_frueher_key && !entry.foto_heute_key && entry.fotos[0] && (
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={fotoUrl(entry.fotos[0].datei_key, token!)}
                alt={entry.fotos[0].bildunterschrift ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,7,4,0.7) 0%, transparent 50%)" }} />
            </div>
          )}
        </div>

        <div style={{ padding: "2rem 3rem", background: "linear-gradient(to bottom, rgba(10,7,4,0.85), #0a0704)", flexShrink: 0 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#F5E8C8", margin: "0 0 0.5rem", lineHeight: 1.1 }}>
            {entry.anzeige_name}
          </p>
          {entry.vorstellung && (
            <p style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)", color: "rgba(245,232,200,0.7)", margin: 0, lineHeight: 1.5, maxWidth: "80ch" }}>
              {entry.vorstellung}
            </p>
          )}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "1.5rem", right: "2rem", display: "flex", gap: "0.4rem" }}>
        {feed.map((_, i) => (
          <div key={i} style={{ width: i === (idx % feed.length) ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === (idx % feed.length) ? A : "rgba(232,153,26,0.25)", transition: "all 0.3s" }} />
        ))}
      </div>

      <div style={{ position: "absolute", top: "1.5rem", right: "2rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(232,153,26,0.4)" }}>
        EMMERICH BOOMT!
      </div>
    </div>
  );
}
