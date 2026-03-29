import { QRCodeSVG } from "qrcode.react";

const URL = "https://emmerich-boomt.replit.app";

export default function PlakatPage() {
  return (
    <div style={{ background: "#2a1f0e", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.5rem" }}>

      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="no-print"
        style={{
          background: "#e8991a",
          border: "none",
          borderRadius: "4px",
          color: "#0a0704",
          padding: "0.75rem 2rem",
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Plakat drucken / als PDF speichern
      </button>
      <p className="no-print" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.5)", margin: "-1rem 0 0" }}>
        Im Druckdialog: Papierformat A1, Ränder auf „Keine" setzen
      </p>

      {/* Poster */}
      <div
        className="plakat"
        style={{
          width: "min(594mm, 95vw)",
          aspectRatio: "594 / 841",
          background: "#E8891A",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Playfair Display', serif",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Sunray background */}
        <Sunrays />

        {/* Top headline */}
        <div style={{
          position: "relative", zIndex: 2,
          textAlign: "center",
          padding: "3.5% 4% 0",
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 11vw, 13rem)",
            lineHeight: 0.9,
            color: "#fff",
            textShadow: "4px 6px 0 rgba(0,0,0,0.22), 0 0 60px rgba(232,153,26,0.5)",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(0.8rem, 2.8vw, 3.2rem)",
            color: "#0a0704",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: "1%",
            opacity: 0.85,
          }}>
            Die BoomerParty
          </div>
        </div>

        {/* Photo */}
        <div style={{
          position: "relative", zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: "2%",
        }}>
          <img
            src="/boomerparty-foto.jpeg"
            alt="BoomerParty"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
        </div>

        {/* Bottom info band */}
        <div style={{
          position: "relative", zIndex: 3,
          background: "#c97d10",
          padding: "3% 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4%",
          flexShrink: 0,
        }}>
          {/* Date + Location */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(1rem, 4.5vw, 5.5rem)",
              color: "#fff",
              textTransform: "uppercase",
              lineHeight: 1.1,
              textShadow: "2px 3px 0 rgba(0,0,0,0.2)",
            }}>
              Samstag,<br />18. Juli 2026
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.7rem, 2.5vw, 2.8rem)",
              color: "#fff",
              opacity: 0.92,
              marginTop: "2%",
              lineHeight: 1.35,
            }}>
              Bölt / Kapaunenberg<br />Emmerich am Rhein
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4%",
          }}>
            <div style={{
              background: "#fff",
              padding: "clamp(4px, 1.2%, 14px)",
              borderRadius: "clamp(4px, 0.8%, 10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              lineHeight: 0,
            }}>
              <QRCodeSVG
                value={URL}
                size={512}
                bgColor="#ffffff"
                fgColor="#0a0704"
                level="H"
                style={{ width: "clamp(60px, 15vw, 180px)", height: "auto", display: "block" }}
              />
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.5rem, 1.5vw, 1.8rem)",
              color: "#fff",
              textAlign: "center",
              opacity: 0.9,
              lineHeight: 1.3,
            }}>
              Jetzt anmelden &amp;<br />mehr erfahren
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        @media print {
          @page {
            size: A1 portrait;
            margin: 0;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: #E8891A !important;
          }
          .no-print { display: none !important; }
          .plakat {
            width: 594mm !important;
            height: 841mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Sunrays() {
  const rays = 20;
  return (
    <svg
      viewBox="0 0 1000 1000"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "55%",
        opacity: 0.35,
        zIndex: 1,
        pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMin slice"
    >
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i / rays) * 360;
        const rad = (angle * Math.PI) / 180;
        const x2 = 500 + Math.cos(rad) * 1200;
        const y2 = -50 + Math.sin(rad) * 1200;
        const aNext = ((i + 0.5) / rays) * 360;
        const rNext = (aNext * Math.PI) / 180;
        const x3 = 500 + Math.cos(rNext) * 1200;
        const y3 = -50 + Math.sin(rNext) * 1200;
        return (
          <polygon key={i} points={`500,-50 ${x2},${y2} ${x3},${y3}`} fill={i % 2 === 0 ? "#fff" : "#c97d10"} />
        );
      })}
    </svg>
  );
}
