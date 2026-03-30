const A  = "#E8991A";
const BG = "#0a0704";
const POSTER_SRC = "/images/boomerpartyposter.jpeg";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function PlakatPage() {
  return (
    <div style={{
      background: BG,
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2rem 1rem",
      gap: "1.5rem",
    }}>

      {/* Download button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={() => { window.location.href = `${BASE}/plakat-print`; }}
          style={{
            background: A,
            border: "none",
            borderRadius: "4px",
            color: BG,
            padding: "0.75rem 2.5rem",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1.05rem",
            cursor: "pointer",
          }}
        >
          Plakat-PDF herunterladen
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.4)", margin: 0, textAlign: "center" }}>
          PDF öffnen → Teilen → Drucken · A0, A1, A2, A3, A4, A5
        </p>
      </div>

      {/* Poster preview */}
      <img
        src={POSTER_SRC}
        alt="Emmerich boomt – Plakat"
        style={{
          width: "min(380px, 92vw)",
          display: "block",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
