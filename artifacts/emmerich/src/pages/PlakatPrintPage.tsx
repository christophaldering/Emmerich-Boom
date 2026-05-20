import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

const A  = "#E8991A";
const BG = "#0a0704";
const FG = "#f5e8c8";
const POSTER_SRC = "/images/boomerpartyposter.jpeg";
const QR_URL = "https://www.emmerich-boomt.de";

const FORMATE = [
  { label: "A0", w: 841,  h: 1189 },
  { label: "A1", w: 594,  h: 841  },
  { label: "A2", w: 420,  h: 594  },
  { label: "A3", w: 297,  h: 420  },
  { label: "A4", w: 210,  h: 297  },
  { label: "A5", w: 148,  h: 210  },
];

export default function PlakatPrintPage() {
  const [format, setFormat]         = useState(FORMATE[1]);
  const [state, setState]           = useState<"idle" | "generating" | "done">("idle");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  async function handleGenerate() {
    setState("generating");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
        img.src = POSTER_SRC;
      });

      const CW = img.naturalWidth;
      const CH = img.naturalHeight;

      /* ── QR-Code als Overlay rechts unten ── */
      const QR_LABEL = "www.emmerich-boomt.de";

      /* QR-Größe je DIN-Format — dezent, nicht zu groß */
      const QR_MM_BY_FORMAT: Record<string, number> = {
        A0: 55, A1: 40, A2: 28, A3: 20, A4: 15, A5: 11,
      };
      const QR_SIZE_MM   = QR_MM_BY_FORMAT[format.label] ?? 20;
      const QR_MARGIN_MM = 6;   // Abstand von der Kante
      const QR_IPAD_MM   = 3;   // inneres Padding im weißen Kästchen
      const FONT_MM      = Math.round(QR_SIZE_MM * 0.16);
      const TEXT_GAP_MM  = 2;

      /* Pixel-per-mm */
      const pxPerMm  = CW / format.w;
      const QR_SIZE  = Math.round(QR_SIZE_MM   * pxPerMm);
      const MARGIN   = Math.round(QR_MARGIN_MM * pxPerMm);
      const IPAD     = Math.round(QR_IPAD_MM   * pxPerMm);
      const FONT_PX  = Math.max(10, Math.round(FONT_MM * pxPerMm));
      const TEXT_GAP = Math.round(TEXT_GAP_MM  * pxPerMm);

      /* Canvas: exakt Plakat-Größe, kein Streifen */
      const canvas = document.createElement("canvas");
      canvas.width  = CW;
      canvas.height = CH;
      const ctx = canvas.getContext("2d")!;

      /* Plakat */
      ctx.drawImage(img, 0, 0, CW, CH);

      /* QR-Code direkt vom hidden QRCodeCanvas-Element lesen */
      const qrSourceCanvas = qrCanvasRef.current;
      if (!qrSourceCanvas) {
        throw new Error("QR-Canvas nicht verfügbar");
      }

      /* Weißes Kästchen rechts unten */
      const BOX_W = IPAD * 2 + QR_SIZE;
      const BOX_H = IPAD * 2 + QR_SIZE + TEXT_GAP + FONT_PX;
      const BOX_X = CW - MARGIN - BOX_W;
      const BOX_Y = CH - MARGIN - BOX_H;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

      /* QR-Code aus dem hidden canvas skaliert einzeichnen */
      ctx.drawImage(qrSourceCanvas, BOX_X + IPAD, BOX_Y + IPAD, QR_SIZE, QR_SIZE);

      /* URL-Label */
      ctx.fillStyle    = "#111111";
      ctx.font         = `bold ${FONT_PX}px sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillText(QR_LABEL, BOX_X + BOX_W / 2, BOX_Y + IPAD + QR_SIZE + TEXT_GAP);
      ctx.textAlign    = "left";
      ctx.textBaseline = "alphabetic";

      /* PDF in Originalformat (kein extra Streifen) */
      const imgData = canvas.toDataURL("image/jpeg", 0.97);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [format.w, format.h],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, format.w, format.h);

      const blob = pdf.output("blob");
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `emmerich-boomt-plakat-${format.label.toLowerCase()}.pdf`;
      a.click();

      setState("done");
    } catch (e) {
      console.error("PDF error:", e);
      setState("idle");
    }
  }

  return (
    <div style={{
      background: BG,
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
      gap: "2rem",
    }}>

      {/* Hidden QR canvas — rendered off-screen so the ref is always available */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", pointerEvents: "none" }}>
        <QRCodeCanvas
          value={QR_URL}
          size={512}
          marginSize={1}
          fgColor="#000000"
          bgColor="#ffffff"
          ref={qrCanvasRef}
        />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(245,232,200,0.45)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 0.6rem" }}>
          Emmerich Boomt · Plakat
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 4vw, 2rem)", color: A, margin: 0, lineHeight: 1.1 }}>
          Plakat als PDF speichern
        </h1>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(245,232,200,0.5)", margin: "0.6rem 0 0", lineHeight: 1.7 }}>
          Hochauflösend · Druckfertig · A0 bis A5
        </p>
      </div>

      {/* Format + Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>

        {/* Format picker */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {FORMATE.map(f => (
            <button key={f.label} onClick={() => { setFormat(f); setState("idle"); }} style={{
              background: f.label === format.label ? A : "transparent",
              border: `1px solid ${A}`,
              borderRadius: "3px",
              color: f.label === format.label ? BG : A,
              padding: "0.4rem 0.85rem",
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
        <button
          onClick={handleGenerate}
          disabled={state === "generating"}
          style={{
            background: state === "done" ? "transparent" : A,
            border: `2px solid ${A}`,
            borderRadius: "6px",
            color: state === "done" ? A : BG,
            padding: "0.85rem 2.5rem",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "1.15rem",
            cursor: state === "generating" ? "wait" : "pointer",
            opacity: state === "generating" ? 0.7 : 1,
            transition: "all 0.2s",
            minWidth: "240px",
          }}
        >
          {state === "generating" ? "PDF wird erstellt …"
           : state === "done"      ? "✓ Erneut herunterladen"
           :                         `⬇ PDF herunterladen (${format.label})`}
        </button>

        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.4)", margin: 0, textAlign: "center" }}>
          PDF öffnen → Teilen → Drucken
        </p>
      </div>

      {/* Instructions */}
      <div style={{
        background: "rgba(245,232,200,0.04)",
        border: "1px solid rgba(232,153,26,0.2)",
        borderRadius: "8px",
        padding: "1.25rem 1.5rem",
        maxWidth: "320px",
        width: "100%",
      }}>
        <p style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "0.78rem", color: A, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 0.9rem" }}>
          Drucken in 3 Schritten
        </p>
        {[
          ["1", "PDF herunterladen (oben)"],
          ["2", `PDF öffnen → Teilen → Drucken`],
          ["3", `Papierformat: ${format.label} · Ränder: Keine`],
        ].map(([n, text]) => (
          <div key={n} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "0.65rem" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: A, fontSize: "1rem", lineHeight: 1.4, minWidth: "1.1rem" }}>{n}</span>
            <span style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: FG, opacity: 0.8, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Poster preview */}
      <img
        src={POSTER_SRC}
        alt="Emmerich boomt – Plakat"
        style={{
          width: "min(280px, 80vw)",
          aspectRatio: `${format.w} / ${format.h}`,
          objectFit: "contain",
          display: "block",
          boxShadow: "0 12px 50px rgba(0,0,0,0.6)",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />

      {/* Back link */}
      <a href="/plakat" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(245,232,200,0.45)", textDecoration: "none" }}>
        ← Zurück zur Plakat-Vorschau
      </a>
    </div>
  );
}
