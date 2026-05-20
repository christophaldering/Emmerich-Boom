import { QRCodeCanvas } from "qrcode.react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const POSTER_SRC = `${BASE}/images/boomerpartyposter.jpeg`;

interface TicketSVGProps {
  name: string;
  nummer: number;
  code?: string;
}

function nameFontSize(name: string): number {
  if (name.length > 24) return 30;
  if (name.length > 18) return 36;
  return 42;
}

export default function TicketSVG({ name, nummer, code }: TicketSVGProps) {
  const id = `t${nummer}`;
  const numStr = String(nummer).padStart(3, "0");
  const fontSize = nameFontSize(name);

  return (
    <svg
      viewBox="0 0 900 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label={`Ticket ${numStr} — ${name}`}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x="0" y="0" width="900" height="340" rx="6" ry="6" />
        </clipPath>

        {/* Gradient: poster fully visible 0-190px (~21%), fade to black by ~350px (~39%) */}
        <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#0A0704" stopOpacity="0" />
          <stop offset="21%"  stopColor="#0A0704" stopOpacity="0" />
          <stop offset="27%"  stopColor="rgb(190,110,18)" stopOpacity="0.35" />
          <stop offset="38%"  stopColor="rgb(50,22,4)"    stopOpacity="0.88" />
          <stop offset="48%"  stopColor="#0A0704"         stopOpacity="0.97" />
          <stop offset="100%" stopColor="#0A0704"         stopOpacity="1" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${id})`}>
        {/* Schwarzer Hintergrund */}
        <rect x="0" y="0" width="900" height="340" fill="#0A0704" />

        {/* LINKER BLOCK — Poster
            Poster-Maß: 1179 × 1774 px (Portrait, ratio ≈ 0.665)
            Bei height=340: natürliche Breite = 340 × (1179/1774) ≈ 226 px
            → Box auf genau diese Breite setzen, meet → kein Letterboxing, kein Crop */}
        <rect x="0" y="0" width="226" height="340" fill="#2a1305" />
        <image
          href={POSTER_SRC}
          x="0" y="0" width="226" height="340"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Fließender Übergang Bild → schwarz */}
        <rect x="0" y="0" width="900" height="340" fill={`url(#fade-${id})`} />

        {/* 1 — "EMMERICH BOOMT!" */}
        <text
          x="370" y="78"
          fontFamily="'Lora', Georgia, serif"
          fontSize="13"
          letterSpacing="3"
          textAnchor="start"
          fill="#E8991A"
        >
          EMMERICH BOOMT!
        </text>

        {/* 2 — Name */}
        <text
          x="370" y="138"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize={fontSize}
          fontWeight="500"
          textAnchor="start"
          fill="#E8991A"
        >
          {name}
        </text>

        {/* 3 — Trennlinie */}
        <line
          x1="370" y1="162" x2="490" y2="162"
          stroke="#E8991A" strokeWidth="1.5" strokeOpacity="0.4"
        />

        {/* 4 — Datum + Einlass */}
        <text
          x="370" y="204"
          fontFamily="'Lora', Georgia, serif"
          fontSize="17"
          textAnchor="start"
          fill="#F5E8C8"
        >
          Samstag, 18. Juli 2026 · Beginn 20:00 Uhr
        </text>

        {/* 5 — Ort */}
        <text
          x="370" y="230"
          fontFamily="'Lora', Georgia, serif"
          fontSize="15"
          textAnchor="start"
          fill="#F5E8C8"
          fillOpacity="0.7"
        >
          Bölt / Kapaunenberg · Emmerich am Rhein
        </text>

        {/* 6 — Abreiß-Streifen (x=760, Breite 140px) */}
        <line
          x1="760" y1="12" x2="760" y2="328"
          stroke="#E8991A" strokeWidth="1" strokeDasharray="3,5" strokeOpacity="0.45"
        />

        {/* EINTRITT — horizontal, oben im Streifen */}
        <text
          x="830" y="40"
          fontFamily="'Lora', Georgia, serif"
          fontSize="10"
          letterSpacing="2.5"
          textAnchor="middle"
          fill="#E8991A"
          fillOpacity="0.55"
        >
          EINTRITT
        </text>

        {/* № — groß, Mitte-oben im Streifen */}
        <text
          x="830" y="118"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="38"
          fontWeight="500"
          textAnchor="middle"
          fill="#E8991A"
        >
          &#x2116;&nbsp;{numStr}
        </text>

        {/* QR-Code — unterer Streifenbereich, heller Hintergrund */}
        {code && (
          <>
            <rect x="779" y="158" width="102" height="102" rx="5" ry="5" fill="#FFF8EC" />
            <foreignObject x="784" y="163" width="92" height="92">
              <div style={{ lineHeight: 0, fontSize: 0 }}>
                <QRCodeCanvas value={code} size={92} bgColor="#FFF8EC" fgColor="#1A0A02" level="H" />
              </div>
            </foreignObject>
          </>
        )}

        {/* 8 — Rand-Zeile unten */}
        <text
          x="375" y="320"
          fontFamily="'Lora', Georgia, serif"
          fontSize="9"
          textAnchor="start"
          fill="#F5E8C8"
          fillOpacity="0.5"
        >
          Eintritt nur mit Ticket, Personalausweis nicht erforderlich, gesundes Hüftgelenk empfohlen.
        </text>

      </g>

      {/* Außenrahmen Amber */}
      <rect
        x="0.75" y="0.75" width="898.5" height="338.5"
        rx="6" ry="6"
        fill="none"
        stroke="#E8991A"
        strokeWidth="1.5"
      />
    </svg>
  );
}
