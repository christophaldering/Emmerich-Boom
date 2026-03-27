import { useState, useEffect } from "react";

const KEY = "emmerich_theme";

function getInitial(): boolean {
  try { return (localStorage.getItem(KEY) ?? "dark") !== "light"; }
  catch { return true; }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", getInitial() ? "dark" : "light");
  }, []);

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label={dark ? "Zur hellen Ansicht wechseln" : "Zur dunklen Ansicht wechseln"}
      style={{
        position: "fixed",
        top: "max(0.65rem, env(safe-area-inset-top))",
        right: "0.75rem",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "2rem",
        border: dark ? "1px solid rgba(232,153,26,0.22)" : "1px solid rgba(150,100,10,0.30)",
        background: dark ? "rgba(10,7,4,0.72)" : "rgba(255,248,220,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer",
        fontFamily: "'Lora', serif",
        fontStyle: "italic",
        fontSize: "0.73rem",
        letterSpacing: "0.04em",
        color: dark ? "rgba(245,232,200,0.65)" : "rgba(26,14,4,0.65)",
        transition: "background 0.3s, color 0.3s, border-color 0.3s",
      }}
    >
      <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{dark ? "☀" : "☾"}</span>
      <span>{dark ? "hell" : "dunkel"}</span>
    </button>
  );
}
