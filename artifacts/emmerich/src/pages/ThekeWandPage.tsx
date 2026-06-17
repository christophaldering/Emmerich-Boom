import { useEffect, useState } from "react";
import { THEKE_SZENE } from "../config/theke-szene";
import { GalerieWand } from "./Galerie";
import type { GalerieEntry } from "./Galerie";

const A  = "#E8991A";
const BG = "#0A0704";

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
  const [token,       setToken]       = useState<string | null>(null);
  const [zugangFehler, setZugangFehler] = useState(false);
  const [feed,         setFeed]        = useState<GalerieEntry[]>([]);
  const [feedNow,      setFeedNow]     = useState(Date.now());

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

    function fetchFeed() {
      fetch("/api/theke/feed", { headers: { "x-theke-token": token! } })
        .then(r => r.json())
        .then((data: GalerieEntry[]) => { setFeed(data); setFeedNow(Date.now()); })
        .catch(() => {});
    }

    fetchFeed();
    const id = setInterval(fetchFeed, 60_000);
    return () => clearInterval(id);
  }, [token]);

  if (zugangFehler) {
    return (
      <div style={{ background: BG, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.45)" }}>
          Kein gültiger Zugang.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, overflow: "hidden" }}>
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: `center/cover no-repeat url(${THEKE_SZENE.BACKDROP_URL})`,
        zIndex: 0,
      }} />
      {/* Abdunkelung */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(10,7,4,0.55) 0%, rgba(10,7,4,0) 20%, rgba(10,7,4,0) 55%, rgba(10,7,4,0.75) 82%, rgba(10,7,4,0.95) 100%)",
      }} />

      {/* Verbinden-Spinner (nur solange kein Token) */}
      {!token && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.8vw, 2rem)", color: A, opacity: 0.65,
            textShadow: "0 2px 14px rgba(0,0,0,0.95)",
          }}>
            Verbinde …
          </p>
        </div>
      )}

      {/* Galerie-Wand — volle Breite, mittig vertikal */}
      {token && (
        <div style={{
          position: "absolute",
          top: "8%", left: 0,
          width: "100%", height: "72%",
          zIndex: 5,
        }}>
          <GalerieWand
            entries={feed}
            token={token}
            now={feedNow}
            beamer
          />
        </div>
      )}

      {/* Titel-Zeile unten */}
      <div style={{
        position: "absolute", bottom: "2rem", left: 0, right: 0, zIndex: 8,
        textAlign: "center", pointerEvents: "none",
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "clamp(1rem, 2.4vw, 1.8rem)", color: A, opacity: 0.55,
          textShadow: "0 2px 10px rgba(0,0,0,0.9)", margin: 0,
          letterSpacing: "0.06em",
        }}>
          EMMERICH BOOMT!
        </p>
        <p style={{
          fontFamily: "'Lora', serif", fontStyle: "italic",
          fontSize: "clamp(0.65rem, 1.4vw, 1rem)", color: "rgba(245,232,200,0.32)",
          margin: "0.3rem 0 0", textShadow: "0 1px 6px rgba(0,0,0,0.9)",
        }}>
          18. Juli 2026 · Bölt / Kapaunenberg · Emmerich am Rhein
        </p>
      </div>
    </div>
  );
}
