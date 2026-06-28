/**
 * Erzeugt 10 QR-Code-PNGs für die Demo-Tickets.
 * Ausgabe: scripts/output/demo-qr/DEMO-01_Anna_Bergmann.png … DEMO-10_…
 *
 * Ausführen: pnpm --filter @workspace/scripts run demo-tickets-qr
 */
import QRCode from "qrcode";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = join(__dirname, "..", "output", "demo-qr");

const BASE_URL = "https://emmerich-boomt.de/boomer-orga-intern/ticket";

const DEMO_PERSONEN = [
  "Anna Bergmann",
  "Klaus Hoffmann",
  "Monika Schmidt",
  "Werner Schulte",
  "Ingrid Fischer",
  "Günter Bauer",
  "Hildegard Meyer",
  "Dieter Wagner",
  "Ursula Koch",
  "Helmut Schäfer",
];

const CODES = DEMO_PERSONEN.map((_, i) =>
  `0DE${String(i + 1).padStart(13, "0")}`.toUpperCase()
);

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 0; i < DEMO_PERSONEN.length; i++) {
    const name   = DEMO_PERSONEN[i]!;
    const code   = CODES[i]!;
    const nummer = `DEMO-${String(i + 1).padStart(2, "0")}`;
    const url    = `${BASE_URL}/${code}`;
    const slug   = name.replace(/\s+/g, "_").replace(/[äöüÄÖÜß]/g, c =>
      ({ ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss" }[c] ?? c)
    );
    const file   = join(OUT_DIR, `${nummer}_${slug}.png`);

    await QRCode.toFile(file, url, {
      errorCorrectionLevel: "M",
      width: 600,
      margin: 3,
      color: { dark: "#0A0704", light: "#F5E8C8" },
    });

    console.log(`  ✓ ${nummer}  ${name}`);
    console.log(`       ${url}`);
    console.log(`       → ${file}`);
  }

  console.log(`\n✓ ${DEMO_PERSONEN.length} QR-Codes gespeichert in:`);
  console.log(`  ${OUT_DIR}`);
}

run().catch(e => { console.error(e); process.exit(1); });
