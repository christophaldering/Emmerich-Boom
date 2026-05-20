import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

export interface TicketRenderData {
  name: string;
  nummer: string;
  code: string;
  posterBuffer: Buffer;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nameFontSize(name: string): number {
  if (name.length > 24) return 32;
  if (name.length > 18) return 38;
  return 44;
}

function extractNumStr(nummer: string): string {
  const parts = nummer.split("-");
  const last = parts[parts.length - 1];
  const n = parseInt(last ?? "0", 10);
  return String(isNaN(n) ? 0 : n).padStart(3, "0");
}

function loadFontBase64(filename: string): string {
  const candidates = [
    path.resolve(__dirname, "assets", "fonts", filename),
    path.resolve(__dirname, "..", "assets", "fonts", filename),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p).toString("base64");
  }
  throw new Error(`Font not found: ${filename}. Searched: ${candidates.join(", ")}`);
}

let _fontStyleBlock: string | null = null;

function getFontStyleBlock(): string {
  if (_fontStyleBlock) return _fontStyleBlock;
  const playfairB64 = loadFontBase64("PlayfairDisplay.ttf");
  const loraB64 = loadFontBase64("Lora.ttf");
  _fontStyleBlock = `<style>
    @font-face {
      font-family: 'Playfair Display';
      src: url('data:font/ttf;base64,${playfairB64}') format('truetype');
      font-weight: 100 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'Lora';
      src: url('data:font/ttf;base64,${loraB64}') format('truetype');
      font-weight: 100 900;
      font-style: normal;
    }
  </style>`;
  return _fontStyleBlock;
}

export async function renderTicketFrontSVG(data: TicketRenderData): Promise<string> {
  const { name, nummer, code, posterBuffer } = data;

  const posterDataUrl = `data:image/jpeg;base64,${posterBuffer.toString("base64")}`;
  const numStr = extractNumStr(nummer);
  const fontSize = nameFontSize(name);

  const qrPngBuffer = await QRCode.toBuffer(code, {
    type: "png",
    margin: 1,
    color: { dark: "#E8991A", light: "#0A0704" },
    width: 96,
  });
  const qrDataUrl = `data:image/png;base64,${qrPngBuffer.toString("base64")}`;

  const uid = nummer.replace(/[^a-zA-Z0-9]/g, "_");
  const fontStyle = getFontStyleBlock();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 900 340" width="900" height="340" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${fontStyle}
  <defs>
    <clipPath id="clip_${uid}">
      <rect x="0" y="0" width="900" height="340" rx="6" ry="6" />
    </clipPath>
    <clipPath id="clip_name_${uid}">
      <rect x="370" y="90" width="460" height="70" />
    </clipPath>
    <linearGradient id="fade_${uid}" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#0A0704" stop-opacity="0" />
      <stop offset="28%"  stop-color="#0A0704" stop-opacity="0" />
      <stop offset="33%"  stop-color="rgb(200,120,20)" stop-opacity="0.30" />
      <stop offset="44%"  stop-color="rgb(160,85,12)"  stop-opacity="0.50" />
      <stop offset="58%"  stop-color="rgb(60,28,5)"    stop-opacity="0.82" />
      <stop offset="72%"  stop-color="#0A0704"         stop-opacity="0.96" />
      <stop offset="100%" stop-color="#0A0704"         stop-opacity="1" />
    </linearGradient>
  </defs>

  <g clip-path="url(#clip_${uid})">
    <rect x="0" y="0" width="900" height="340" fill="#0A0704" />

    <rect x="0" y="0" width="300" height="340" fill="#2a1305" />
    <image href="${posterDataUrl}" x="0" y="0" width="300" height="340" preserveAspectRatio="xMidYMid slice" />

    <rect x="0" y="0" width="900" height="340" fill="url(#fade_${uid})" />

    <text x="370" y="80"
      font-family="'Lora', Georgia, serif"
      font-size="13" letter-spacing="3" text-anchor="start" fill="#E8991A">EMMERICH BOOMT!</text>

    <text x="370" y="142"
      font-family="'Playfair Display', Georgia, serif"
      font-size="${fontSize}" font-weight="500" text-anchor="start" fill="#E8991A"
      clip-path="url(#clip_name_${uid})">${escXml(name)}</text>

    <line x1="370" y1="166" x2="490" y2="166"
      stroke="#E8991A" stroke-width="1.5" stroke-opacity="0.4" />

    <text x="370" y="208"
      font-family="'Lora', Georgia, serif"
      font-size="17" text-anchor="start" fill="#F5E8C8">Samstag, 18. Juli 2026 &#xB7; Beginn 20:00 Uhr</text>

    <text x="370" y="234"
      font-family="'Lora', Georgia, serif"
      font-size="15" text-anchor="start" fill="#F5E8C8" fill-opacity="0.7">B&#xF6;lt / Kapaunenberg &#xB7; Emmerich am Rhein</text>

    <line x1="840" y1="12" x2="840" y2="308"
      stroke="#E8991A" stroke-width="1" stroke-dasharray="3,5" stroke-opacity="0.45" />

    <g transform="rotate(-90, 858, 160)">
      <text x="858" y="148"
        font-family="'Lora', Georgia, serif"
        font-size="16" letter-spacing="3" text-anchor="middle"
        fill="#E8991A" fill-opacity="0.55">EINTRITT</text>
      <text x="858" y="180"
        font-family="'Playfair Display', Georgia, serif"
        font-size="52" font-weight="500" text-anchor="middle" fill="#E8991A">&#x2116; ${escXml(numStr)}</text>
    </g>

    <image href="${qrDataUrl}" x="740" y="232" width="96" height="96" opacity="1" />

    <text x="450" y="322"
      font-family="'Lora', Georgia, serif"
      font-size="9" text-anchor="middle" fill="#F5E8C8" fill-opacity="0.5">Eintritt nur mit Ticket, Personalausweis nicht erforderlich, gesundes H&#xFC;ftgelenk empfohlen.</text>
  </g>

  <rect x="0.75" y="0.75" width="898.5" height="338.5"
    rx="6" ry="6" fill="none" stroke="#E8991A" stroke-width="1.5" />
</svg>`;
}

export async function renderTicketFrontPNG(data: TicketRenderData): Promise<Buffer> {
  const svg = await renderTicketFrontSVG(data);
  return sharp(Buffer.from(svg, "utf-8"))
    .resize(1800, 680)
    .png()
    .toBuffer();
}
