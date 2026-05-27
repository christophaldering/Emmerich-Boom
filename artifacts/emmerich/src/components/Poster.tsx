import { useState, useEffect, useCallback } from "react";
import { useHymneAudio } from "@/contexts/HymneAudioContext";

const ZITATE = [
  "Früher war mehr Lametta.",
  "Damals waren die Sommer länger.",
  "Es gab eine Zeit, da hatte man nur einen Schlüsselbund.",
  "Bei uns wurde noch gewählt — auf der Wählscheibe.",
  "Eine Mark fünfzig für ein Eis. Mit Schokostreuseln.",
  "Wir haben uns vor der Telefonzelle verabredet. Und es hat geklappt.",
  "Discman, Walkman, Game Boy — alles in einer Hosentasche.",
  "Mixtapes machen war eine Liebeserklärung.",
  "Sonntags lief Tagesschau und dann tatsächlich Schluss.",
  "Anrufbeantworter waren ein Hightech-Gerät.",
  "Bevor's WhatsApp gab, gab's Telegramme.",
  "Wir hatten drei Programme. Und es reichte.",
  "Pläsierig — das Wort kennt heute keiner mehr.",
  "Die Bravo war noch ein gedrucktes Magazin.",
  "Wenn das Telefon klingelte, wusste niemand, wer dran war.",
];

export default function Poster() {
  const [zitat, setZitat] = useState<string | null>(null);
  const { toggle, isPlaying } = useHymneAudio();

  const open = useCallback(() => {
    setZitat(ZITATE[Math.floor(Math.random() * ZITATE.length)]);
  }, []);

  const close = useCallback(() => setZitat(null), []);

  useEffect(() => {
    if (!zitat) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zitat, close]);

  return (
    <section style={{ position: "relative", height: "100svh", overflow: "hidden" }}>
      <img
        src="/images/boomerpartyposter.jpeg"
        alt="Boomer Party Poster"
        onClick={open}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center center",
          display: "block",
          background: "#2a1a06",
          cursor: "pointer",
        }}
      />

      {/* Hymne Play-Button Overlay */}
      <button
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        aria-label={isPlaying ? "Hymne pausieren" : "Die Hymne abspielen"}
        style={{
          position: "absolute",
          bottom: "2.2rem",
          right: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          background: "rgba(10,7,4,0.78)",
          border: "1.5px solid rgba(232,153,26,0.55)",
          borderRadius: "100px",
          padding: "0.55rem 1rem 0.55rem 0.65rem",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          transition: "border-color 0.18s, background 0.18s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,153,26,0.9)";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,7,4,0.92)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,153,26,0.55)";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,7,4,0.78)";
        }}
      >
        {/* Icon circle */}
        <span style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#E8991A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {isPlaying ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0A0704">
              <rect x="5" y="3" width="4" height="18"/>
              <rect x="15" y="3" width="4" height="18"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0A0704">
              <polygon points="6,3 20,12 6,21"/>
            </svg>
          )}
        </span>
        <span style={{
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.8rem",
          color: "#F5E8C8",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}>
          {isPlaying ? "läuft …" : "Die Hymne"}
        </span>
      </button>

      {zitat && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,7,4,0.70)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0A0704",
              border: "1.5px solid #E8991A",
              borderRadius: "8px",
              padding: "32px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "22px",
              color: "#F5E8C8",
              margin: "0 0 16px",
              lineHeight: 1.5,
            }}>
              „{zitat}"
            </p>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "11px",
              color: "#F5E8C8",
              opacity: 0.5,
              margin: 0,
            }}>
              Tippe irgendwo, um zu schließen.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
