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

/**
 * Builds SVG layers WITHOUT the poster image and WITHOUT a solid background rect.
 * The gradient is transparent on the left (where the poster will be composited beneath)
 * and opaque dark on the right. QR code and all text are included.
 */
async function buildSvgLayers(data: Omit<TicketRenderData, "posterBuffer">): Promise<string> {
  const { name, nummer, code } = data;

  const numStr = extractNumStr(nummer);
  const fontSize = nameFontSize(name);

  const qrPngBuffer = await QRCode.toBuffer(code, {
    type: "png",
    margin: 1,
    color: { dark: "#1A0A02", light: "#FFF8EC" },
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
    <!-- Gradient: transparent 0-28% (poster shows through), fades to solid dark by 72% -->
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
    <!-- No solid background rect here — dark base is added via sharp.create() -->
    <!-- No poster image here — poster is composited as a separate sharp layer -->

    <!-- Gradient overlay: transparent left (poster visible), opaque dark right -->
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

    <rect x="735" y="227" width="106" height="106" rx="5" ry="5" fill="#FFF8EC" />
    <image href="${qrDataUrl}" x="740" y="232" width="96" height="96" />

    <text x="450" y="322"
      font-family="'Lora', Georgia, serif"
      font-size="9" text-anchor="middle" fill="#F5E8C8" fill-opacity="0.5">Eintritt nur mit Ticket, Personalausweis nicht erforderlich, gesundes H&#xFC;ftgelenk empfohlen.</text>
  </g>

  <rect x="0.75" y="0.75" width="898.5" height="338.5"
    rx="6" ry="6" fill="none" stroke="#E8991A" stroke-width="1.5" />
</svg>`;
}

/** @deprecated kept for any external callers — internally we use buildSvgLayers + composite */
export async function renderTicketFrontSVG(data: TicketRenderData): Promise<string> {
  return buildSvgLayers(data);
}

/**
 * Portrait "Handy-Ticket" — 1080×1680px, optimized for phone screenshots.
 * Layout: poster (top third) → gradient fade → event info → name → QR (large) → number → footer.
 */
async function buildHandySvg(data: Omit<TicketRenderData, "posterBuffer">): Promise<string> {
  const { name, nummer, code } = data;
  const numStr = extractNumStr(nummer);
  const fontStyle = getFontStyleBlock();
  const uid = nummer.replace(/[^a-zA-Z0-9]/g, "_");

  const qrPngBuffer = await QRCode.toBuffer(code, {
    type: "png",
    margin: 2,
    color: { dark: "#1A0A02", light: "#FFF8EC" },
    width: 220,
  });
  const qrDataUrl = `data:image/png;base64,${qrPngBuffer.toString("base64")}`;

  // viewBox 540×840 → rendered 1080×1680
  // Poster layer is composited separately (top 0..230)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 540 840" width="540" height="840" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${fontStyle}
  <defs>
    <clipPath id="hclip_${uid}">
      <rect x="0" y="0" width="540" height="840" rx="10" ry="10" />
    </clipPath>
    <!-- Vertical gradient: transparent at top (poster shows), opaque dark from ~180px -->
    <linearGradient id="hfade_${uid}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#0A0704" stop-opacity="0" />
      <stop offset="55%"  stop-color="#0A0704" stop-opacity="0" />
      <stop offset="72%"  stop-color="#0A0704" stop-opacity="0.75" />
      <stop offset="85%"  stop-color="#0A0704" stop-opacity="0.97" />
      <stop offset="100%" stop-color="#0A0704" stop-opacity="1" />
    </linearGradient>
  </defs>

  <g clip-path="url(#hclip_${uid})">
    <!-- Gradient over poster area -->
    <rect x="0" y="0" width="540" height="290" fill="url(#hfade_${uid})" />

    <!-- Solid dark background for lower portion -->
    <rect x="0" y="245" width="540" height="595" fill="#0A0704" />

    <!-- Gold top border line -->
    <rect x="0" y="0" width="540" height="3" fill="#E8991A" fill-opacity="0.6" />

    <!-- EMMERICH BOOMT! label -->
    <text x="270" y="318"
      font-family="'Lora', Georgia, serif"
      font-size="11" letter-spacing="4" text-anchor="middle" fill="#E8991A">EMMERICH BOOMT!</text>

    <!-- Name -->
    <text x="270" y="370"
      font-family="'Playfair Display', Georgia, serif"
      font-size="${name.length > 20 ? 28 : name.length > 14 ? 34 : 40}" font-weight="600"
      text-anchor="middle" fill="#F5E8C8">${escXml(name)}</text>

    <!-- Gold divider line -->
    <line x1="140" y1="392" x2="400" y2="392" stroke="#E8991A" stroke-width="1" stroke-opacity="0.45" />

    <!-- Date + time -->
    <text x="270" y="424"
      font-family="'Lora', Georgia, serif"
      font-size="15" text-anchor="middle" fill="#F5E8C8">Samstag, 18. Juli 2026 &#xB7; 20:00 Uhr</text>

    <!-- Venue -->
    <text x="270" y="448"
      font-family="'Lora', Georgia, serif"
      font-size="13" text-anchor="middle" fill="#F5E8C8" fill-opacity="0.65">B&#xF6;lt / Kapaunenberg &#xB7; Emmerich am Rhein</text>

    <!-- QR code background -->
    <rect x="155" y="472" width="230" height="230" rx="8" ry="8" fill="#FFF8EC" />
    <image href="${qrDataUrl}" x="160" y="477" width="220" height="220" />

    <!-- Ticket number below QR -->
    <text x="270" y="732"
      font-family="'Lora', Georgia, serif"
      font-size="11" letter-spacing="3" text-anchor="middle" fill="#E8991A" fill-opacity="0.7">EINTRITT</text>
    <text x="270" y="770"
      font-family="'Playfair Display', Georgia, serif"
      font-size="42" font-weight="500" text-anchor="middle" fill="#E8991A">&#x2116; ${escXml(numStr)}</text>

    <!-- Footer -->
    <text x="270" y="820"
      font-family="'Lora', Georgia, serif"
      font-size="8.5" text-anchor="middle" fill="#F5E8C8" fill-opacity="0.35">Eintritt nur mit Ticket &#xB7; gesundes H&#xFC;ftgelenk empfohlen</text>

    <!-- Gold border -->
    <rect x="1" y="1" width="538" height="838" rx="10" ry="10" fill="none" stroke="#E8991A" stroke-width="1.5" stroke-opacity="0.6" />
  </g>
</svg>`;
}

export async function renderHandyTicketPNG(data: TicketRenderData): Promise<Buffer> {
  const { posterBuffer } = data;

  const svgLayers = await buildHandySvg(data);
  const svgPng = await sharp(Buffer.from(svgLayers, "utf-8"))
    .resize(1080, 1680)
    .png()
    .toBuffer();

  // Poster: full width, top ~290/840 of height = ~580px
  const posterPng = await sharp(posterBuffer)
    .resize(1080, 580, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  return sharp({
    create: { width: 1080, height: 1680, channels: 3, background: { r: 10, g: 7, b: 4 } },
  })
    .composite([
      { input: posterPng, top: 0, left: 0 },
      { input: svgPng,    top: 0, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function renderTicketFrontPNG(data: TicketRenderData): Promise<Buffer> {
  const { posterBuffer } = data;

  // 1. Render SVG layers (gradient + text/QR) — transparent where gradient is transparent
  const svgLayers = await buildSvgLayers(data);
  const svgPng = await sharp(Buffer.from(svgLayers, "utf-8"))
    .resize(1800, 680)
    .png()
    .toBuffer();

  // 2. Resize poster to left-column dimensions.
  //    In the SVG viewBox (900×340), the poster occupies x=0..300 (1/3 of width).
  //    In the output image (1800×680), that's 600px wide × 680px tall.
  const posterPng = await sharp(posterBuffer)
    .resize(600, 680, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  // 3. Composite layers:
  //    - Dark base fills the whole canvas (#0A0704)
  //    - Poster placed at left (x=0, y=0), 600×680
  //    - SVG overlay on top (gradient makes left side transparent → poster shows,
  //      right side opaque dark → covers poster with solid dark)
  return sharp({
    create: { width: 1800, height: 680, channels: 3, background: { r: 10, g: 7, b: 4 } },
  })
    .composite([
      { input: posterPng, top: 0, left: 0 },
      { input: svgPng,    top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}
