import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
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

function drawSunrays(ctx: CanvasRenderingContext2D, CW: number, CH: number) {
  const rays = 20;
  const cx = CW / 2, cy = -CH * 0.05;
  const r = CW * 1.4;
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < rays; i++) {
    const a1 = ((i / rays) * 360 * Math.PI) / 180;
    const a2 = (((i + 0.5) / rays) * 360 * Math.PI) / 180;
    const a3 = ((((i + 1) / rays) * 360 * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#c97d10";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    ctx.lineTo(cx + Math.cos(a3) * r, cy + Math.sin(a3) * r);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#c97d10" : "#ffffff";
    ctx.fill();
  }
  ctx.restore();
}

export default function PlakatPage() {
  const [format, setFormat] = useState(FORMATE[1]);
  const [generating, setGenerating] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      await document.fonts.ready;

      const photoImg = new Image();
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = () => reject(new Error("Foto"));
        photoImg.src = "/boomerparty-foto.jpeg";
      });

      const CW = 1200;
      const CH = Math.round(CW * format.h / format.w);
      const canvas = document.createElement("canvas");
      canvas.width = CW;
      canvas.height = CH;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#E8891A";
      ctx.fillRect(0, 0, CW, CH);

      const photoAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      const canvasAspect = CW / CH;
      let pw: number, ph: number, px: number, py: number;
      if (photoAspect > canvasAspect) {
        pw = CW; ph = CW / photoAspect; px = 0; py = (CH - ph) / 2;
      } else {
        ph = CH; pw = CH * photoAspect; px = (CW - pw) / 2; py = 0;
      }
      ctx.drawImage(photoImg, px, py, pw, ph);

      drawSunrays(ctx, CW, CH);

      const topGrad = ctx.createLinearGradient(0, 0, 0, CH * 0.52);
      topGrad.addColorStop(0, "rgba(232,137,26,0.97)");
      topGrad.addColorStop(0.68, "rgba(232,137,26,0.97)");
      topGrad.addColorStop(1, "rgba(232,137,26,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, CW, CH * 0.52);

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowOffsetX = CW * 0.004;
      ctx.shadowOffsetY = CW * 0.005;
      ctx.shadowBlur = 0;
      const headSize = Math.round(CW * 0.195);
      ctx.font = `900 ${headSize}px "Playfair Display", Georgia, serif`;
      ctx.fillText("EMMERICH", CW / 2, CH * 0.135);
      ctx.fillText("BOOMT!", CW / 2, CH * 0.265);
      ctx.shadowColor = "transparent";

      ctx.fillStyle = "rgba(10,7,4,0.85)";
      const subSize = Math.round(CW * 0.042);
      ctx.font = `italic ${subSize}px "Lora", Georgia, serif`;
      ctx.fillText("Die BoomerParty", CW / 2, CH * 0.318);

      const btmGrad = ctx.createLinearGradient(0, CH * 0.62, 0, CH);
      btmGrad.addColorStop(0, "rgba(170,90,5,0)");
      btmGrad.addColorStop(0.38, "rgba(170,90,5,0.97)");
      btmGrad.addColorStop(1, "rgba(170,90,5,0.97)");
      ctx.fillStyle = btmGrad;
      ctx.fillRect(0, CH * 0.62, CW, CH * 0.38);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowOffsetX = CW * 0.002;
      ctx.shadowOffsetY = CW * 0.003;
      ctx.shadowBlur = 0;
      const dateSize = Math.round(CW * 0.088);
      ctx.font = `900 ${dateSize}px "Playfair Display", Georgia, serif`;
      const leftX = CW * 0.05;
      ctx.fillText("Samstag,", leftX, CH * 0.815);
      ctx.fillText("18. Juli 2026", leftX, CH * 0.905);
      ctx.shadowColor = "transparent";

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      const locSize = Math.round(CW * 0.038);
      ctx.font = `italic ${locSize}px "Lora", Georgia, serif`;
      ctx.fillText("Bölt / Kapaunenberg", leftX, CH * 0.948);
      ctx.fillText("Emmerich am Rhein", leftX, CH * 0.979);

      if (qrRef.current) {
        const qrSize = CW * 0.22;
        const qrX = CW * 0.695;
        const qrY = CH * 0.8;
        const pad = qrSize * 0.07;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2);
        ctx.drawImage(qrRef.current, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "left";
        const lblSize = Math.round(CW * 0.03);
        ctx.font = `italic ${lblSize}px "Lora", Georgia, serif`;
        ctx.fillText("Jetzt anmelden &", qrX + qrSize + CW * 0.018, qrY + qrSize * 0.38);
        ctx.fillText("mehr erfahren", qrX + qrSize + CW * 0.018, qrY + qrSize * 0.65);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
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
    <div style={{ background: "#2a1f0e", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem" }}>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {FORMATE.map(f => (
            <button key={f.label} onClick={() => setFormat(f)} style={{
              background: f.label === format.label ? "#e8991a" : "transparent",
              border: "1px solid #e8991a", borderRadius: "3px",
              color: f.label === format.label ? "#0a0704" : "#e8991a",
              padding: "0.4rem 0.9rem", fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", fontSize: "0.95rem",
              fontWeight: f.label === format.label ? 700 : 400, cursor: "pointer",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={downloadPDF} disabled={generating} style={{
          background: "#e8991a", border: "none", borderRadius: "4px",
          color: "#0a0704", padding: "0.7rem 2rem",
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          fontWeight: 700, fontSize: "1rem",
          cursor: generating ? "wait" : "pointer", opacity: generating ? 0.7 : 1,
        }}>
          {generating ? "PDF wird erstellt …" : `PDF herunterladen (${format.label})`}
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.45)", margin: 0, textAlign: "center" }}>
          PDF öffnen → Drucken → Papierformat {format.label} · Ränder „Keine"
        </p>
      </div>

      {/* Sichtbare Vorschau */}
      <div style={{
        width: `min(${format.w}mm, 92vw)`,
        aspectRatio: `${format.w} / ${format.h}`,
        background: "#E8891A",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        fontFamily: "'Playfair Display', serif",
        boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
        flexShrink: 0,
      }}>
        <img src="/boomerparty-foto.jpeg" alt="BoomerParty"
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center", display: "block", position: "absolute", inset: 0, zIndex: 1 }}
        />
        <Sunrays />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
          background: "linear-gradient(to bottom, rgba(232,137,26,0.97) 70%, rgba(232,137,26,0))",
          textAlign: "center", padding: "3% 4% 8%",
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.5rem, 11vw, 13rem)", lineHeight: 0.9, color: "#fff", textShadow: "4px 6px 0 rgba(0,0,0,0.22)", textTransform: "uppercase" }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.55rem, 2.8vw, 3.2rem)", color: "#0a0704", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "1%", opacity: 0.85 }}>
            Die BoomerParty
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
          background: "linear-gradient(to top, rgba(170,90,5,0.97) 65%, rgba(170,90,5,0))",
          padding: "8% 5% 3.5%", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "4%",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(0.8rem, 4.5vw, 5.5rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, textShadow: "2px 3px 0 rgba(0,0,0,0.2)" }}>
              Samstag,<br />18. Juli 2026
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.5rem, 2.5vw, 2.8rem)", color: "#fff", opacity: 0.92, marginTop: "2%", lineHeight: 1.35 }}>
              Bölt / Kapaunenberg<br />Emmerich am Rhein
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: "3%" }}>
            <div style={{ background: "#fff", padding: "clamp(3px, 1.2%, 14px)", borderRadius: "clamp(3px, 0.8%, 10px)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", lineHeight: 0, flexShrink: 0 }}>
              <QRCodeCanvas
                ref={qrRef}
                value={SITE_URL}
                size={512}
                bgColor="#ffffff"
                fgColor="#0a0704"
                level="H"
                style={{ width: "clamp(50px, 14vw, 170px)", height: "auto", display: "block" }}
              />
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.4rem, 1.4vw, 1.7rem)", color: "#fff", opacity: 0.9, lineHeight: 1.4 }}>
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
    <svg viewBox="0 0 1000 1000"
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
