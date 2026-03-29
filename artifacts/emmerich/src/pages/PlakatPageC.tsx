import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const SITE_URL = "https://emmerich-boomt.replit.app";

const FORMATE = [
  { label: "A0", size: "A0", w: 841, h: 1189 },
  { label: "A1", size: "A1", w: 594, h: 841  },
  { label: "A2", size: "A2", w: 420, h: 594  },
  { label: "A3", size: "A3", w: 297, h: 420  },
  { label: "A4", size: "A4", w: 210, h: 297  },
  { label: "A5", size: "A5", w: 148, h: 210  },
];

export default function PlakatPageC() {
  const [format, setFormat] = useState(FORMATE[1]);

  return (
    <div style={{ background: "#0d0904", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem" }}>

      {/* Controls */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>

        {/* Variant links */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.6)" }}>
          <span>Variante:</span>
          <a href="/plakat" style={{ color: "rgba(245,232,200,0.6)", textDecoration: "underline" }}>Original</a>
          <a href="/plakat-b" style={{ color: "rgba(245,232,200,0.6)", textDecoration: "underline" }}>B (Retro)</a>
          <span style={{ color: "#ff8c00", fontWeight: 700 }}>C (Modern)</span>
        </div>

        {/* Format picker */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {FORMATE.map(f => (
            <button
              key={f.label}
              onClick={() => setFormat(f)}
              style={{
                background: f.label === format.label ? "#ff8c00" : "transparent",
                border: "1px solid #ff8c00",
                borderRadius: "3px",
                color: f.label === format.label ? "#0d0904" : "#ff8c00",
                padding: "0.4rem 0.9rem",
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
                fontWeight: f.label === format.label ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Print button */}
        <button
          onClick={() => window.print()}
          style={{
            background: "#ff8c00",
            border: "none",
            borderRadius: "4px",
            color: "#0d0904",
            padding: "0.7rem 2rem",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Plakat drucken / als PDF speichern ({format.label})
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.35)", margin: 0, textAlign: "center" }}>
          Im Druckdialog: Papierformat {format.label} · Ränder auf „Keine" setzen
        </p>
      </div>

      {/* Poster – Variante C: Modern & Edgy */}
      <div
        className="plakat"
        style={{
          width: `min(${format.w}mm, 92vw)`,
          aspectRatio: `${format.w} / ${format.h}`,
          background: "#0d0904",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Playfair Display', serif",
          boxShadow: "0 20px 80px rgba(0,0,0,0.9)",
          flexShrink: 0,
          border: "1px solid rgba(255,140,0,0.15)",
        }}
      >
        {/* === HEADLINE AREA (top, orange on dark) === */}
        <div style={{
          flexShrink: 0,
          background: "#0d0904",
          padding: "5% 6% 4%",
          textAlign: "center",
          borderBottom: "clamp(2px, 0.5%, 6px) solid #ff8c00",
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 10.5vw, 12rem)",
            lineHeight: 0.88,
            color: "#ff8c00",
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "clamp(0.5rem, 2.4vw, 2.8rem)",
            color: "rgba(245,232,200,0.75)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: "2%",
          }}>
            Die BoomerParty
          </div>
        </div>

        {/* === PHOTO (free, no overlay) === */}
        <div style={{
          flex: 1,
          position: "relative",
          background: "#0d0904",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          padding: "2.5% 5%",
        }}>
          <img
            src="/boomerparty-foto.jpeg"
            alt="BoomerParty"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        </div>

        {/* === FOOTER STRIPE (creme/light, dark text) === */}
        <div style={{
          flexShrink: 0,
          background: "#f5e8c8",
          padding: "2.5% 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4%",
          borderTop: "clamp(3px, 0.7%, 8px) solid #ff8c00",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(0.8rem, 4.2vw, 5rem)",
              color: "#0d0904",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}>
              Samstag,<br />18. Juli 2026
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.5rem, 2.1vw, 2.5rem)",
              color: "#3d1800",
              marginTop: "2%",
              lineHeight: 1.35,
            }}>
              Bölt / Kapaunenberg<br />Emmerich am Rhein
            </div>
          </div>

          {/* QR Code */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "6%" }}>
            <div style={{
              background: "#fff",
              padding: "clamp(3px, 1.2%, 14px)",
              borderRadius: "clamp(2px, 0.5%, 6px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              lineHeight: 0,
              border: "1px solid rgba(0,0,0,0.08)",
            }}>
              <QRCodeSVG
                value={SITE_URL}
                size={512}
                bgColor="#ffffff"
                fgColor="#0a0704"
                level="H"
                style={{ width: "clamp(50px, 13vw, 160px)", height: "auto", display: "block" }}
              />
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.4rem, 1.3vw, 1.5rem)",
              color: "#3d1800",
              textAlign: "center",
              lineHeight: 1.3,
            }}>
              Jetzt anmelden &amp;<br />mehr erfahren
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: ${format.size} portrait; margin: 0; }
          body, html { margin: 0 !important; padding: 0 !important; background: #0d0904 !important; }
          .no-print { display: none !important; }
          .plakat {
            width: ${format.w}mm !important;
            height: ${format.h}mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
