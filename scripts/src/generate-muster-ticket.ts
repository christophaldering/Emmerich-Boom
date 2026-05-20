import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../../muster-ticket.pdf");
const POSTER = path.join(__dirname, "../../artifacts/emmerich/public/images/boomerpartyposter.jpeg");

const AMBER = "#E8991A";
const DARK  = "#0A0704";
const WARM  = "#F5E8C8";
const WHITE = "#ffffff";

const TICKET_CODE = "MUSTER-0000-DEMO";
const PERSON_NAME = "Muster Person";

// A4 landscape
const W = 841.89;
const H = 595.28;

const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

// ── Seite 1: Ticket Vorderseite ──────────────────────────────────────────────

// Hintergrund
doc.rect(0, 0, W, H).fill(DARK);

// Poster-Bild links (ca. 280px breit)
const POSTER_W = 280;
const POSTER_H = H;
if (fs.existsSync(POSTER)) {
  doc.image(POSTER, 0, 0, { width: POSTER_W, height: POSTER_H, cover: [POSTER_W, POSTER_H], align: "center", valign: "top" });
}

// Gradient über dem Poster (schwarz rechts)
const grad = doc.linearGradient(180, 0, POSTER_W, 0);
grad.stop(0, DARK, 0);
grad.stop(1, DARK, 1);
doc.rect(180, 0, POSTER_W - 180, H).fill(grad);

// Rahmen außen
doc.rect(30, 30, W - 60, H - 60).lineWidth(1.5).strokeColor(AMBER, 0.6).stroke();

// ── Mitte: Text ──────────────────────────────────────────────────────────────
const MX = POSTER_W + 30;

// Label
doc
  .font("Helvetica")
  .fontSize(8)
  .fillColor(AMBER, 0.8)
  .text("EINTRITTSTICKET · EMMERICH BOOMT!", MX, 130, { characterSpacing: 2 });

// Name (groß, kursiv via Helvetica-Oblique)
doc
  .font("Helvetica-Oblique")
  .fontSize(52)
  .fillColor(AMBER)
  .text(PERSON_NAME, MX, 155, { lineBreak: false });

// Trennlinie
doc.moveTo(MX, 225).lineTo(MX + 55, 225).lineWidth(1).strokeColor(AMBER, 0.35).stroke();

// Datum + Ort
doc
  .font("Helvetica")
  .fontSize(15)
  .fillColor(WARM)
  .text("Samstag, 18. Juli 2026 · Beginn 20:00 Uhr", MX, 240);

doc
  .font("Helvetica")
  .fontSize(12)
  .fillColor(WARM, 0.6)
  .text("Bölt / Kapaunenberg · Emmerich am Rhein", MX, 268);

doc
  .font("Helvetica-Oblique")
  .fontSize(9)
  .fillColor(WARM, 0.3)
  .text("Dieses Ticket ist personenbezogen und nicht übertragbar.", MX, 310);

// ── Rechts: Abreiß-Streifen ──────────────────────────────────────────────────
const RX = W - 130;

// Gestrichelte Linie
doc.moveTo(RX, 40).lineTo(RX, H - 40).lineWidth(1).dash(5, { space: 5 }).strokeColor(AMBER, 0.4).stroke();
doc.undash();

// "EINTRITT" vertikal
doc.save();
doc.translate(RX + 18, H / 2 + 40);
doc.rotate(-90);
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(AMBER, 0.85)
  .text("EINTRITT", 0, 0, { characterSpacing: 4 });
doc.restore();

// QR-Code Platzhalter (einfaches Muster-QR-Raster)
const QX = RX + 20;
const QY = H / 2 - 50;
const QS = 90;
doc.rect(QX, QY, QS, QS).fill(WHITE);
doc.rect(QX + 2, QY + 2, QS - 4, QS - 4).fill(DARK);

// Eck-Quadrate (wie echter QR)
const corners = [[QX + 5, QY + 5], [QX + QS - 25, QY + 5], [QX + 5, QY + QS - 25]] as [number, number][];
for (const [cx, cy] of corners) {
  doc.rect(cx, cy, 20, 20).fill(WHITE);
  doc.rect(cx + 3, cy + 3, 14, 14).fill(DARK);
  doc.rect(cx + 6, cy + 6, 8, 8).fill(WHITE);
}

// Code unter QR
doc
  .font("Courier")
  .fontSize(7)
  .fillColor(AMBER, 0.65)
  .text(TICKET_CODE, QX, QY + QS + 8, { width: QS, align: "center" });

// MUSTER-Wasserzeichen diagonal
doc.save();
doc.translate(W / 2, H / 2);
doc.rotate(-35);
doc
  .font("Helvetica-Bold")
  .fontSize(110)
  .fillColor("#ffffff", 0.04)
  .text("MUSTER", -200, -60, { lineBreak: false });
doc.restore();

// ── Seite 2: Rückseite ───────────────────────────────────────────────────────
doc.addPage({ size: "A4", layout: "portrait", margin: 0 });

const PW = 595.28;
const PH = 841.89;

// Amber-Streifen oben
doc.rect(0, 0, PW, 18).fill(AMBER);

// Inhalt
const TX = 60;
const TY = 60;
const TW = PW - 120;

doc
  .font("Helvetica-Bold")
  .fontSize(13)
  .fillColor("#1a1208")
  .text("Wir freuen uns auf euch!", TX, TY, { width: TW });

doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor("#3a2e1e", 0.85)
  .moveDown(0.8)
  .text(
    "Dieses Ticket berechtigt eine Person zum Eintritt bei der Boomerparty am Samstag, " +
    "18. Juli 2026, ab 20:00 Uhr in der Gaststätte Kapaunenberg (Bölt), Emmerich am Rhein.\n\n" +
    "Bitte zeige beim Einlass dieses Ticket (ausgedruckt oder auf dem Smartphone). " +
    "Der QR-Code wird beim Einlass gescannt — kein QR-Code, kein Einlass.\n\n" +
    "Das Ticket ist personenbezogen und nicht übertragbar.",
    { width: TW }
  );

// Fakten-Tabelle
const tableY = doc.y + 20;
const rows: [string, string][] = [
  ["Veranstaltung", "EMMERICH BOOMT! — BoomerParty 2026"],
  ["Datum",         "Samstag, 18. Juli 2026"],
  ["Beginn",        "20:00 Uhr (Einlass ab 19:30 Uhr)"],
  ["Location",      "Gaststätte Kapaunenberg, Bölt, Emmerich am Rhein"],
  ["Eintritt",      "10 € pro Person (inkl. Abendprogramm)"],
  ["Kontakt",       "boomerparty26@emmerich-boomt.de"],
];

let ry = tableY;
for (const [k, v] of rows) {
  doc.moveTo(TX, ry).lineTo(TX + TW, ry).lineWidth(0.5).strokeColor("#e0d0b0", 0.6).stroke();
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#b37a14").text(k, TX, ry + 6, { width: 100 });
  doc.font("Helvetica").fontSize(9).fillColor("#1a1208").text(v, TX + 110, ry + 6, { width: TW - 110 });
  ry += 26;
}
doc.moveTo(TX, ry).lineTo(TX + TW, ry).lineWidth(0.5).strokeColor("#e0d0b0", 0.6).stroke();

// Person
doc
  .font("Helvetica-Bold")
  .fontSize(11)
  .fillColor("#1a1208")
  .text(`Ticket für: ${PERSON_NAME}`, TX, ry + 24, { width: TW });

doc
  .font("Courier")
  .fontSize(9)
  .fillColor("#b37a14")
  .text(`Code: ${TICKET_CODE}`, TX, ry + 44, { width: TW });

// Slogan
const sloganY = PH - 130;
doc.moveTo(TX, sloganY).lineTo(TX + TW, sloganY).lineWidth(0.5).strokeColor("#e0d0b0", 0.4).stroke();

const slogans = ["Von uns.", "Für uns.", "Wird Zeit."];
let sy = sloganY + 16;
for (let i = 0; i < slogans.length; i++) {
  doc
    .font("Helvetica-Oblique")
    .fontSize(22)
    .fillColor(i === 1 ? "#b37a14" : "#1a1208")
    .text(slogans[i], TX, sy, { width: TW });
  sy += 30;
}

// Amber-Streifen unten
doc.rect(0, PH - 18, PW, 18).fill(AMBER);

doc.end();

stream.on("finish", () => {
  console.log(`✓ Muster-Ticket gespeichert: ${OUT}`);
});
stream.on("error", (err) => {
  console.error("Fehler:", err);
  process.exit(1);
});
