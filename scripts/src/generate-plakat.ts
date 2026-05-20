import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT    = path.join(__dirname, "../../plakat-boomerparty-2026.pdf");
const POSTER = path.join(__dirname, "../../artifacts/emmerich/public/images/boomerpartyposter.jpeg");

// A3 portrait (mm → pt: 1mm = 2.8346pt)
const A3_W = 841.89;  // 297mm
const A3_H = 1190.55; // 420mm

const AMBER = "#E8991A";
const DARK  = "#0A0704";
const WARM  = "#F5E8C8";

const doc = new PDFDocument({ size: "A3", layout: "portrait", margin: 0 });
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

// Hintergrund
doc.rect(0, 0, A3_W, A3_H).fill(DARK);

// Poster-Bild — füllt die oberen ~80% der Seite
const IMG_H = A3_H * 0.78;
const IMG_W = A3_W;
if (fs.existsSync(POSTER)) {
  // Das Bild ist 1179x1774 (portrait) — passt gut auf A3 portrait
  doc.image(POSTER, 0, 0, {
    width: IMG_W,
    height: IMG_H,
    cover: [IMG_W, IMG_H],
    align: "center",
    valign: "top",
  });
}

// Gradient unten über dem Bild (für Lesbarkeit der Infos)
const grad = doc.linearGradient(0, IMG_H - 120, 0, IMG_H);
grad.stop(0, DARK, 0);
grad.stop(1, DARK, 0.92);
doc.rect(0, IMG_H - 120, A3_W, 120).fill(grad);

// Amber-Trennlinie
doc.rect(0, IMG_H, A3_W, 3).fill(AMBER);

// Info-Block unten
const INFO_Y = IMG_H + 3;
const INFO_H = A3_H - INFO_Y;

doc.rect(0, INFO_Y, A3_W, INFO_H).fill(DARK);

// Datum & Ort — zentriert
const CENTER = A3_W / 2;

doc
  .font("Helvetica-Bold")
  .fontSize(38)
  .fillColor(WARM)
  .text("SAMSTAG, 18. JULI 2026", 0, INFO_Y + 28, { align: "center", width: A3_W, characterSpacing: 2 });

doc
  .font("Helvetica")
  .fontSize(22)
  .fillColor(AMBER, 0.9)
  .text("Bölt / Gaststätte Kapaunenberg · Emmerich am Rhein", 0, INFO_Y + 84, { align: "center", width: A3_W });

// Trennpunkte
const dotY = INFO_Y + 130;
const dots = ["Eintritt: 10 €", "Beginn: 20:00 Uhr", "Anmeldung: emmerich-boomt.de"];
const dotSpacing = A3_W / (dots.length + 1);
dots.forEach((d, i) => {
  const x = dotSpacing * (i + 1);
  // Punkt
  doc.circle(x, dotY + 5, 2.5).fill(AMBER, 0.6);
  doc
    .font("Helvetica")
    .fontSize(15)
    .fillColor(WARM, 0.75)
    .text(d, x - 120, dotY + 16, { width: 240, align: "center" });
});

// Feine Linie am unteren Rand
doc.rect(40, A3_H - 18, A3_W - 80, 0.5).fill(AMBER, 0.2);

doc.end();
stream.on("finish", () => console.log(`✓ Plakat gespeichert: ${OUT}`));
stream.on("error",  (e) => { console.error(e); process.exit(1); });
