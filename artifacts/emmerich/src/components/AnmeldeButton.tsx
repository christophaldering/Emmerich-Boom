const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AnmeldeButton() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "0.7rem 1rem max(0.7rem, env(safe-area-inset-bottom))",
        background: "rgba(10,7,4,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(232,153,26,0.30)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.82rem",
          color: "rgba(245,232,200,0.6)",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Phase-1-Eintrag reicht nicht — jetzt verbindlich anmelden
      </span>
      <a
        href={`${BASE}/anmeldung`}
        style={{
          display: "inline-block",
          background: "#E8991A",
          color: "#0A0704",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "0.92rem",
          letterSpacing: "0.04em",
          padding: "0.5rem 1.4rem",
          borderRadius: "3px",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Jetzt anmelden →
      </a>
    </div>
  );
}
