import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const SITE_URL = "https://emmerich-boomt.replit.app";

const FORMATE = [
  { label: "A0", size: "A0", w: 841, h: 1189 },
  { label: "A1", size: "A1", w: 594, h: 841  },
  { label: "A2", size: "A2", w: 420, h: 594  },
  { label: "A3", size: "A3", w: 297, h: 420  },
  { label: "A4", size: "A4", w: 210, h: 297  },
  { label: "A5", size: "A5", w: 148, h: 210  },
];

export default function PlakatPage() {
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
      pdf.save(`emmerich-boomt-plakat-${format.label.toLowerCase()}.pdf`);
    } catch (e) { console.error(e); alert("PDF konnte nicht erstellt werden."); }
    setGenerating(false);
  };

  return (
    <div style={{ background: "#2a1f0e", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem" }}>

      {/* Controls */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
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

      {/* Poster */}
      <div
        ref={plakatRef}
        className="plakat"
        style={{
          width: `min(${format.w}mm, 92vw)`,
          aspectRatio: `${format.w} / ${format.h}`,
          background: "#E8891A",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Playfair Display', serif",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
          flexShrink: 0,
        }}
      >
        {/* Full photo — no cropping */}
        <img
          src="/boomerparty-foto.jpeg"
          alt="BoomerParty"
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center", display: "block", position: "absolute", inset: 0, zIndex: 1 }}
        />

        {/* Sunrays behind headline only */}
        <Sunrays />

        {/* Top overlay: headline */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          zIndex: 3,
          background: "linear-gradient(to bottom, rgba(232,137,26,0.97) 70%, rgba(232,137,26,0))",
          textAlign: "center",
          padding: "3% 4% 8%",
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 11vw, 13rem)",
            lineHeight: 0.9,
            color: "#fff",
            textShadow: "4px 6px 0 rgba(0,0,0,0.22)",
            textTransform: "uppercase",
          }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "clamp(0.55rem, 2.8vw, 3.2rem)",
            color: "#0a0704",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: "1%",
            opacity: 0.85,
          }}>
            Die BoomerParty
          </div>
        </div>

        {/* Bottom overlay: date + QR */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          zIndex: 3,
          background: "linear-gradient(to top, rgba(170,90,5,0.97) 65%, rgba(170,90,5,0))",
          padding: "8% 5% 3.5%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "4%",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(0.8rem, 4.5vw, 5.5rem)",
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
              fontSize: "clamp(0.5rem, 2.5vw, 2.8rem)",
              color: "#fff",
              opacity: 0.92,
              marginTop: "2%",
              lineHeight: 1.35,
            }}>
              Bölt / Kapaunenberg<br />Emmerich am Rhein
            </div>
          </div>

          {/* QR Code + Label nebeneinander */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: "3%" }}>
            <div style={{
              background: "#fff",
              padding: "clamp(3px, 1.2%, 14px)",
              borderRadius: "clamp(3px, 0.8%, 10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
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
              fontSize: "clamp(0.4rem, 1.4vw, 1.7rem)",
              color: "#fff",
              opacity: 0.9,
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

function Sunrays() {
  const rays = 20;
  return (
    <svg
      viewBox="0 0 1000 1000"
      style={{ position: "absolute", inset: 0, width: "100%", height: "55%", opacity: 0.35, zIndex: 1, pointerEvents: "none" }}
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
        return <polygon key={i} points={`500,-50 ${x2},${y2} ${x3},${y3}`} fill={i % 2 === 0 ? "#fff" : "#c97d10"} />;
      })}
    </svg>
  );
}
