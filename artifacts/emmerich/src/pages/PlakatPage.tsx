import { useState } from "react";
import { jsPDF } from "jspdf";

const POSTER_SRC = "/images/boomerpartyposter.jpeg";

const FORMATE = [
  { label: "A0", w: 841,  h: 1189 },
  { label: "A1", w: 594,  h: 841  },
  { label: "A2", w: 420,  h: 594  },
  { label: "A3", w: 297,  h: 420  },
  { label: "A4", w: 210,  h: 297  },
  { label: "A5", w: 148,  h: 210  },
];

export default function PlakatPage() {
  const [format, setFormat]       = useState(FORMATE[1]);
  const [generating, setGenerating] = useState(false);

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
        img.src = POSTER_SRC;
      });

      const CW = img.naturalWidth  || 1200;
      const CH = img.naturalHeight || Math.round(CW * format.h / format.w);

      const canvas = document.createElement("canvas");
      canvas.width  = CW;
      canvas.height = CH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CW, CH);
      ctx.drawImage(img, 0, 0, CW, CH);

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [format.w, format.h] });
      pdf.addImage(imgData, "JPEG", 0, 0, format.w, format.h);
      pdf.save(`emmerich-boomt-plakat-${format.label.toLowerCase()}.pdf`);
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF konnte nicht erstellt werden.");
    }
    setGenerating(false);
  };

  return (
    <div style={{
      background: "#0a0704",
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2rem 1rem",
      gap: "1.5rem",
    }}>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>

        {/* Format picker */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {FORMATE.map(f => (
            <button key={f.label} onClick={() => setFormat(f)} style={{
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
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Download button */}
        <button onClick={downloadPDF} disabled={generating} style={{
          background: "#e8991a",
          border: "none",
          borderRadius: "4px",
          color: "#0a0704",
          padding: "0.7rem 2.5rem",
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: generating ? "wait" : "pointer",
          opacity: generating ? 0.7 : 1,
        }}>
          {generating ? "PDF wird erstellt …" : `PDF herunterladen (${format.label})`}
        </button>

        <p style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.78rem",
          color: "rgba(245,232,200,0.45)",
          margin: 0,
          textAlign: "center",
        }}>
          PDF öffnen → Drucken → Papierformat {format.label} · Ränder „Keine"
        </p>
      </div>

      {/* Poster preview */}
      <img
        src={POSTER_SRC}
        alt="Emmerich boomt – Plakat"
        style={{
          width: `min(${format.w}mm, 92vw)`,
          aspectRatio: `${format.w} / ${format.h}`,
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
