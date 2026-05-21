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
// No separate Bold TTF — register same face; synthetic bold via fill+stroke (see boldHeading)
function getPlayfairBoldBuffer(): Buffer { return getPlayfairBuffer(); }

/** Draw text with fill+stroke (PDF text rendering mode 2) for synthetic bold. */
function boldHeading(
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  opts: Record<string, unknown> = {}
): void {
  const d = doc as unknown as { _textRenderingMode: number };
  const prev = d._textRenderingMode ?? 0;
  d._textRenderingMode = 2;
  doc.lineWidth(0.35);
  doc.text(text, x, y, opts);
  d._textRenderingMode = prev;
  doc.lineWidth(1);
}

function drawBackPage(doc: InstanceType<typeof PDFDocument>, H: number, name: string): void {
  const W = A5_W;
  const PAD = 28;

  doc.rect(0, 0, W, H).fill(DARK);

  doc.rect(0.75, 0.75, W - 1.5, H - 1.5)
    .lineWidth(1.5)
    .strokeColor(AMBER)
    .stroke();

  let y = PAD;

  doc
    .font("Playfair")
    .fontSize(7)
    .fillColor(AMBER)
    .text("GEGR\u00DCNDET 2024 \u2013 AN DER THEKE DER NOSTALGIE", PAD, y, {
      width: W - PAD * 2,
      align: "center",
      characterSpacing: 1.8,
    });

  y = doc.y + 10;

  doc.font("Playfair-Bold").fontSize(22).fillColor(WARM).strokeColor(WARM);
  boldHeading(doc, "Wir freuen uns auf euch!", PAD, y, {
    width: W - PAD * 2,
    align: "center",
  });

  y = doc.y + 12;

  doc.moveTo(PAD + 40, y).lineTo(W - PAD - 40, y)
    .lineWidth(0.8).strokeColor(AMBER, 0.35).stroke();

  y += 12;

  doc
    .font("Lora")
    .fontSize(7.5)
    .fillColor(WARM)
    .text(
      `Liebes ${name},`,
      PAD, y, { width: W - PAD * 2, align: "center" }
    );

  y = doc.y + 4;

  doc
    .font("Lora")
    .fontSize(7.5)
    .fillColor(WARM)
    .text(
      "dein Ticket f\u00FCr die BoomerParty ist reserviert. Wir erwarten dich zu einem Abend, " +
      "an dem gute Musik, alte Freunde und ein Glas zu viel v\u00F6llig in Ordnung sind. " +
      "Bring deinen QR-Code mit \u2013 wir scannen dich rein.",
      PAD, y, { width: W - PAD * 2, align: "center", lineGap: 1.5 }
    );

  y = doc.y + 14;

  const colW = (W - PAD * 2 - 16) / 2;
  const col2X = PAD + colW + 16;

  const leftItems: [string, string][] = [
    ["DATUM", "18. Juli 2026, ab 19:00 Uhr"],
    ["ORT", "B\u00F6lt\u2009/\u2009Kapaunenberg, Emmerich am Rhein"],
  ];
  const rightItems: [string, string][] = [
    ["EINTRITT", "Auf Einladung"],
    ["ZUGANG", "Ab 25 Jahren"],
  ];

  const colStartY = y;

  for (const [label, value] of leftItems) {
    doc.font("Playfair-Bold").fontSize(6.5).fillColor(AMBER).strokeColor(AMBER);
    boldHeading(doc, label, PAD, y, { characterSpacing: 1.4, width: colW });
    y = doc.y + 1;
    doc.font("Lora").fontSize(7.5).fillColor(WARM).text(value, PAD, y, { width: colW, lineGap: 0.8 });
    y = doc.y + 6;
  }

  y = colStartY;

  for (const [label, value] of rightItems) {
    doc.font("Playfair-Bold").fontSize(6.5).fillColor(AMBER).strokeColor(AMBER);
    boldHeading(doc, label, col2X, y, { characterSpacing: 1.4, width: colW });
    y = doc.y + 1;
    doc.font("Lora").fontSize(7.5).fillColor(WARM).text(value, col2X, y, { width: colW, lineGap: 0.8 });
    y = doc.y + 6;
  }

  const footerY = H - PAD - 14;

  doc.moveTo(PAD, footerY).lineTo(W - PAD, footerY)
    .lineWidth(0.8).strokeColor(AMBER, 0.3).stroke();

  doc
    .font("Lora")
    .fontSize(6.5)
    .fillColor(WARM, 0.55)
    .text(
      "Dieses Ticket ist personalisiert und nicht \u00FCbertragbar. Der QR-Code wird am Einlass gescannt.",
      PAD, footerY + 5, { width: W - PAD * 2, align: "center" }
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
    doc.registerFont("Playfair-Bold", getPlayfairBoldBuffer());

    for (let i = 0; i < tickets.length; i++) {
      const png = pngs[i]!;

      doc.addPage({ size: [A5_W, TICKET_H], margin: 0 });
      doc.image(png, 0, 0, { width: A5_W });

      doc.addPage({ size: [A5_W, TICKET_H], margin: 0 });
      drawBackPage(doc, TICKET_H, tickets[i]!.name);
    }

    doc.end();
  });
}
