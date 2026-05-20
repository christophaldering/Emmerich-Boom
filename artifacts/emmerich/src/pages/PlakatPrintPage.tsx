import { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const A  = "#E8991A";
const BG = "#0a0704";
const FG = "#f5e8c8";
const POSTER_SRC = "/images/boomerpartyposter.jpeg";

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

  async function handleGenerate() {
    setState("generating");
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
        img.src = POSTER_SRC;
      });

      const CW = img.naturalWidth;
      const CH = img.naturalHeight;

      /* ── QR-Code-Maße vorab berechnen (formatabhängig in mm) ── */
      const QR_URL   = "https://www.emmerich-boomt.de";
      const QR_LABEL = "www.emmerich-boomt.de";

      /* Physische QR-Größe je DIN-Format */
      const QR_MM_BY_FORMAT: Record<string, number> = {
        A0: 80, A1: 60, A2: 45, A3: 32, A4: 24, A5: 18,
      };
      const QR_SIZE_MM  = QR_MM_BY_FORMAT[format.label] ?? 32;
      const QR_PAD_MM   = 7;
      const FONT_MM     = Math.round(QR_SIZE_MM * 0.18);
      const TEXT_GAP_MM = 3;
      /* Gesamthöhe des Streifens in mm */
      const STRIP_H_MM  = QR_PAD_MM + QR_SIZE_MM + TEXT_GAP_MM + FONT_MM + QR_PAD_MM;

      /* Pixel-per-mm aus der nativen Bildbreite */
      const pxPerMm  = CW / format.w;
      const QR_SIZE  = Math.round(QR_SIZE_MM  * pxPerMm);
      const QR_PAD   = Math.round(QR_PAD_MM   * pxPerMm);
      const FONT_PX  = Math.round(FONT_MM     * pxPerMm);
      const TEXT_GAP = Math.round(TEXT_GAP_MM * pxPerMm);
      const STRIP_H  = Math.round(STRIP_H_MM  * pxPerMm);

      /* Canvas: Plakat + weißer Streifen darunter */
      const canvas = document.createElement("canvas");
      canvas.width  = CW;
      canvas.height = CH + STRIP_H;
      const ctx = canvas.getContext("2d")!;

      /* Weißer Hintergrund (Plakat + Streifen) */
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CW, CH + STRIP_H);

      /* Plakat */
      ctx.drawImage(img, 0, 0, CW, CH);

      /* Dünne Trennlinie zwischen Plakat und Streifen */
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth   = Math.max(1, Math.round(pxPerMm * 0.3));
      ctx.beginPath();
      ctx.moveTo(0, CH);
      ctx.lineTo(CW, CH);
      ctx.stroke();

      /* QR-Code generieren (höhere interne Auflösung für Schärfe) */
      const qrDataUrl = await QRCode.toDataURL(QR_URL, {
        margin: 1,
        width: Math.max(512, QR_SIZE * 2),
        color: { dark: "#000000", light: "#ffffff" },
      });
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.src = qrDataUrl;
      });

      /* QR-Code zentriert im Streifen */
      const QR_X = Math.round((CW - QR_SIZE) / 2);
      const QR_Y = CH + QR_PAD;
      ctx.drawImage(qrImg, QR_X, QR_Y, QR_SIZE, QR_SIZE);

      /* URL-Label unter dem QR-Code */
      ctx.fillStyle    = "#111111";
      ctx.font         = `bold ${FONT_PX}px sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillText(QR_LABEL, CW / 2, QR_Y + QR_SIZE + TEXT_GAP);
      ctx.textAlign    = "left";
      ctx.textBaseline = "alphabetic";

      /* PDF mit erweiterter Seitenhöhe (Plakat + Streifen) */
      const TOTAL_H_MM = format.h + STRIP_H_MM;
      const imgData = canvas.toDataURL("image/jpeg", 0.97);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [format.w, TOTAL_H_MM],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, format.w, TOTAL_H_MM);

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
      alert("PDF konnte nicht erstellt werden.");
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
