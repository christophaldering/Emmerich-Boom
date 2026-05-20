import PDFDocument from "pdfkit";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderTicketFrontPNG } from "./ticket-render.js";

export interface TicketData {
  name: string;
  nummer: string;
  code: string;
}

export interface GeneratePDFOptions {
  posterBuffer?: Buffer;
}

const AMBER = "#E8991A";
const DARK  = "#0A0704";
const WARM  = "#F5E8C8";

const A5_W = 595;
const A5_H = 420;
const TICKET_H = Math.round(A5_W * 340 / 900);

let _posterBuffer: Buffer | null = null;
function getPosterBuffer(): Buffer {
  if (!_posterBuffer) {
    const p = fileURLToPath(new URL("../assets/boomerpartyposter.jpeg", import.meta.url));
    _posterBuffer = readFileSync(p);
  }
  return _posterBuffer;
}

function findFontBuffer(filename: string): Buffer {
  const candidates = [
    path.resolve(__dirname, "assets", "fonts", filename),
    path.resolve(__dirname, "..", "assets", "fonts", filename),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p);
  }
  throw new Error(`Font not found: ${filename}. Searched: ${candidates.join(", ")}`);
}

let _loraBuffer: Buffer | null = null;
let _playfairBuffer: Buffer | null = null;
function getLoraBuffer(): Buffer    { return (_loraBuffer    ??= findFontBuffer("Lora.ttf")); }
function getPlayfairBuffer(): Buffer { return (_playfairBuffer ??= findFontBuffer("PlayfairDisplay.ttf")); }

function drawBackPage(doc: InstanceType<typeof PDFDocument>): void {
  const W = A5_W;
  const H = A5_H;
  const PAD = 28;

  doc.rect(0, 0, W, H).fill(DARK);

  doc.rect(0.75, 0.75, W - 1.5, H - 1.5)
    .lineWidth(1.5)
    .strokeColor(AMBER)
    .stroke();

  let y = PAD;

  doc
    .font("Playfair")
    .fontSize(9)
    .fillColor(AMBER)
    .text("WAS DICH ERWARTET", PAD, y, { characterSpacing: 2.5 });

  y += 16;

  doc
    .font("Lora")
    .fontSize(9)
    .fillColor(WARM)
    .text(
      "Ein Abend, an dem niemand sein Handy braucht, um sich zu erinnern, wie alles war. " +
      "Niemand sagt \u201ewir m\u00FCssen los\u201c, bevor es 23 Uhr ist. Und niemand bestellt einen Aperol Spritz.",
      PAD, y, { width: W - PAD * 2, lineGap: 1.5 }
    );

  y = doc.y + 10;

  doc.moveTo(PAD, y).lineTo(W - PAD, y)
    .lineWidth(0.8).strokeColor(AMBER, 0.25).stroke();

  y += 10;

  doc
    .font("Playfair")
    .fontSize(9)
    .fillColor(AMBER)
    .text("HAUSREGELN", PAD, y, { characterSpacing: 2.5 });

  y += 15;

  const rules: [string, string][] = [
    ["\u00A7 1", "Mitbringen erw\u00FCnscht: gute Laune, ein paar Geschichten, der Song, den du auf der Anmeldung genannt hast."],
    ["\u00A7 2", "Mitbringen unerw\u00FCnscht: Kinder unter 25, sofern nicht vollj\u00E4hrig."],
    ["\u00A7 3", "Die Veranstalter haften nicht f\u00FCr: Heiserkeit am n\u00E4chsten Morgen, peinliche Tanzeinlagen, pl\u00F6tzliche Erinnerungen an die 80er."],
    ["\u00A7 4", "Der Spruch \u201eDas h\u00E4tte es fr\u00FCher nicht gegeben\u201c gilt als Begr\u00FC\u00DFung."],
    ["\u00A7 5", "Tickets sind personalisiert. Ein Tausch innerhalb des Haushalts ist erlaubt, ein Verkauf bei eBay verboten und vermutlich auch nicht lohnend."],
  ];

  for (const [para, text] of rules) {
    const beforeY = y;

    doc
      .font("Playfair")
      .fontSize(8)
      .fillColor(AMBER)
      .text(para, PAD, y, { width: 22, lineBreak: false });

    doc
      .font("Lora")
      .fontSize(8)
      .fillColor(WARM)
      .text(text, PAD + 24, beforeY, { width: W - PAD * 2 - 24, lineGap: 1 });

    y = doc.y + 4;
  }

  y += 4;

  doc.moveTo(PAD, y).lineTo(W - PAD, y)
    .lineWidth(1).strokeColor(AMBER, 0.4).stroke();

  y += 8;

  doc
    .font("Lora")
    .fontSize(8)
    .fillColor(WARM)
    .text(
      "Veranstalter: BoomerClub Emmerich \u00B7 Ein loser Zusammenschluss von Menschen, " +
      "die sich seit Karneval 2024 an der Theke der Soziet\u00E4t kennen.",
      PAD, y, { width: W - PAD * 2, lineGap: 1 }
    );

  y = doc.y + 4;

  doc
    .font("Lora")
    .fontSize(8)
    .fillColor(WARM, 0.65)
    .text(
      "Kontakt: boomerparty26@emmerich-boomt.de \u00B7 www.emmerich-boomt.de",
      PAD, y, { width: W - PAD * 2 }
    );
}

export async function generateTicketPDF(tickets: TicketData[], opts: GeneratePDFOptions = {}): Promise<Buffer> {
  const posterBuffer = opts.posterBuffer ?? getPosterBuffer();

  const pngs = await Promise.all(
    tickets.map(t =>
      renderTicketFrontPNG({ name: t.name, nummer: t.nummer, code: t.code, posterBuffer })
    )
  );

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Lora", getLoraBuffer());
    doc.registerFont("Playfair", getPlayfairBuffer());

    for (let i = 0; i < tickets.length; i++) {
      const png = pngs[i]!;

      doc.addPage({ size: [A5_W, TICKET_H], margin: 0 });
      doc.image(png, 0, 0, { width: A5_W });

      doc.addPage({ size: [A5_W, A5_H], margin: 0 });
      drawBackPage(doc);
    }

    doc.end();
  });
}
