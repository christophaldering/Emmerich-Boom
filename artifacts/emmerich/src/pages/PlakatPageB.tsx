import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const SITE_URL = "https://www.emmerich-boomt.de";

const FORMATE = [
  { label: "A0", size: "A0", w: 841, h: 1189 },
  { label: "A1", size: "A1", w: 594, h: 841  },
  { label: "A2", size: "A2", w: 420, h: 594  },
  { label: "A3", size: "A3", w: 297, h: 420  },
  { label: "A4", size: "A4", w: 210, h: 297  },
  { label: "A5", size: "A5", w: 148, h: 210  },
];

export default function PlakatPageB() {
  const [format, setFormat] = useState(FORMATE[1]);
  const [generating, setGenerating] = useState(false);
  const plakatRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!plakatRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(plakatRef.current, { scale: 2, useCORS: false, allowTaint: true, backgroundColor: null, logging: false, imageTimeout: 0 });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [format.w, format.h] });
      pdf.addImage(imgData, "JPEG", 0, 0, format.w, format.h);
      pdf.save(`emmerich-boomt-plakat-b-${format.label.toLowerCase()}.pdf`);
    } catch (e) { console.error(e); alert("PDF konnte nicht erstellt werden."); }
    setGenerating(false);
  };

  return (
    <div style={{ background: "#2a1f0e", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem" }}>

      {/* Controls */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>

        {/* Variant links */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.6)" }}>
          <span>Variante:</span>
          <a href="/plakat" style={{ color: "#e8991a", textDecoration: "underline" }}>Original</a>
          <span style={{ color: "#e8991a", fontWeight: 700 }}>B (Retro)</span>
          <a href="/plakat-c" style={{ color: "rgba(245,232,200,0.6)", textDecoration: "underline" }}>C (Modern)</a>
        </div>

        {/* Format picker */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {FORMATE.map(f => (
            <button
              key={f.label}
              onClick={() => setFormat(f)}
              style={{
                background: f.label === format.label ? "#e8991a" : "transparent",
                border: "1px solid #e8991a",
                borderRadius: "3px",
                color: f.label === format.label ? "#0a0704" : "#e8991a",
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

        {/* Download button */}
        <button
          onClick={downloadPDF}
          disabled={generating}
          style={{
            background: "#e8991a",
            border: "none",
            borderRadius: "4px",
            color: "#0a0704",
            padding: "0.7rem 2rem",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: generating ? "wait" : "pointer",
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? "PDF wird erstellt …" : `PDF herunterladen (${format.label})`}
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.45)", margin: 0, textAlign: "center" }}>
          PDF öffnen → Drucken → Papierformat {format.label} · Ränder „Keine"
        </p>
      </div>

      {/* Poster – Variante B: Retro-Plakat */}
      <div
        ref={plakatRef}
        className="plakat"
        style={{
          width: `min(${format.w}mm, 92vw)`,
          aspectRatio: `${format.w} / ${format.h}`,
          background: "#1a0e05",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Playfair Display', serif",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
          flexShrink: 0,
        }}
      >
        {/* === HEADER BAR === */}
        <div style={{
          position: "relative",
          zIndex: 2,
          background: "#E8891A",
          flexShrink: 0,
          padding: "3.5% 5% 3%",
          textAlign: "center",
          overflow: "hidden",
        }}>
          {/* Sunrays only inside the header bar */}
          <SunraysBar />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 11vw, 13rem)",
              lineHeight: 0.88,
              color: "#fff",
              textShadow: "4px 6px 0 rgba(0,0,0,0.25)",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
            }}>
              EMMERICH<br />BOOMT!
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.55rem, 2.5vw, 3rem)",
              color: "#3d1800",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: "1.5%",
              fontWeight: 600,
            }}>
              Die BoomerParty
            </div>
          </div>
        </div>

        {/* === PHOTO (middle, with inner frame) === */}
        <div style={{
          flex: 1,
          position: "relative",
          padding: "2.5% 4%",
          background: "#1a0e05",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}>
          {/* White inner frame */}
          <div style={{
            width: "100%",
            height: "100%",
            padding: "1.8%",
            background: "#fff",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
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
        </div>

        {/* === FOOTER BAR === */}
        <div style={{
          position: "relative",
          zIndex: 2,
          background: "#3d1800",
          flexShrink: 0,
          overflow: "hidden",
          padding: "2.5% 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4%",
        }}>
          {/* Subtle sunray texture in footer */}
          <SunraysBarDark />
          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(0.8rem, 4.5vw, 5.5rem)",
              color: "#fff",
              textTransform: "uppercase",
              lineHeight: 1.1,
              textShadow: "2px 3px 0 rgba(0,0,0,0.3)",
            }}>
              Samstag,<br />18. Juli 2026
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.5rem, 2.2vw, 2.6rem)",
              color: "#f5c97e",
              marginTop: "2%",
              lineHeight: 1.35,
            }}>
              Bölt / Kapaunenberg<br />Emmerich am Rhein
            </div>
          </div>

          {/* QR Code + Label nebeneinander */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: "3%", position: "relative", zIndex: 2 }}>
            <div style={{
              background: "#fff",
              padding: "clamp(3px, 1.2%, 14px)",
              borderRadius: "clamp(3px, 0.8%, 10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              lineHeight: 0,
              flexShrink: 0,
            }}>
              <QRCodeCanvas
                value={SITE_URL}
                size={512}
                bgColor="#ffffff"
                fgColor="#0a0704"
                level="H"
                style={{ width: "clamp(50px, 14vw, 170px)", height: "auto", display: "block" }}
              />
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "clamp(0.4rem, 1.3vw, 1.5rem)",
              color: "#f5c97e",
              lineHeight: 1.4,
            }}>
              Jetzt anmelden &amp;<br />mehr erfahren
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function SunraysBar() {
  const rays = 18;
  return (
    <svg
      viewBox="0 0 1000 300"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18, pointerEvents: "none", zIndex: 1 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i / rays) * 360;
        const rad = (angle * Math.PI) / 180;
        const x2 = 500 + Math.cos(rad) * 1400;
        const y2 = 150 + Math.sin(rad) * 1400;
        const aNext = ((i + 0.5) / rays) * 360;
        const rNext = (aNext * Math.PI) / 180;
        const x3 = 500 + Math.cos(rNext) * 1400;
        const y3 = 150 + Math.sin(rNext) * 1400;
        return <polygon key={i} points={`500,150 ${x2},${y2} ${x3},${y3}`} fill={i % 2 === 0 ? "#fff" : "#c97d10"} />;
      })}
    </svg>
  );
}

function SunraysBarDark() {
  const rays = 18;
  return (
    <svg
      viewBox="0 0 1000 300"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1, pointerEvents: "none", zIndex: 1 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i / rays) * 360;
        const rad = (angle * Math.PI) / 180;
        const x2 = 500 + Math.cos(rad) * 1400;
        const y2 = 150 + Math.sin(rad) * 1400;
        const aNext = ((i + 0.5) / rays) * 360;
        const rNext = (aNext * Math.PI) / 180;
        const x3 = 500 + Math.cos(rNext) * 1400;
        const y3 = 150 + Math.sin(rNext) * 1400;
        return <polygon key={i} points={`500,150 ${x2},${y2} ${x3},${y3}`} fill={i % 2 === 0 ? "#fff" : "#6b3010"} />;
      })}
    </svg>
  );
}
