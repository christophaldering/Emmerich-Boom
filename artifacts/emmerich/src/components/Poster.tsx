import { useState, useEffect, useCallback } from "react";

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
          background: "var(--bg-page)",
          cursor: "pointer",
        }}
      />

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
