const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AnmeldeButton() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "0.55rem 1rem",
        background: "rgba(10,7,4,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(232,153,26,0.30)",
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
        Phase-1-Eintrag zählt nicht mehr — hier neu anmelden
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
          padding: "0.4rem 1.2rem",
          borderRadius: "3px",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Jetzt verbindlich anmelden →
      </a>
    </div>
  );
}
