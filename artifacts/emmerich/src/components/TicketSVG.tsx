const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const POSTER_SRC = `${BASE}/images/boomerpartyposter.jpeg`;

interface TicketSVGProps {
  name: string;
  nummer: number;
}

function nameFontSize(name: string): number {
  if (name.length > 24) return 32;
  if (name.length > 18) return 38;
  return 44;
}

export default function TicketSVG({ name, nummer }: TicketSVGProps) {
  const id = `t${nummer}`;
  const numStr = String(nummer).padStart(3, "0");
  const fontSize = nameFontSize(name);

  return (
    <svg
      viewBox="0 0 900 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label={`Ticket ${numStr} — ${name}`}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x="0" y="0" width="900" height="320" rx="6" ry="6" />
        </clipPath>

        {/* Warm-Amber-Fade: Poster-Wärme nach rechts auslaufen lassen */}
        <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#0A0704"       stopOpacity="0" />
          <stop offset="28%"  stopColor="#0A0704"       stopOpacity="0" />
          <stop offset="33%"  stopColor="rgb(200,120,20)" stopOpacity="0.30" />
          <stop offset="44%"  stopColor="rgb(160,85,12)"  stopOpacity="0.50" />
          <stop offset="58%"  stopColor="rgb(60,28,5)"    stopOpacity="0.82" />
          <stop offset="72%"  stopColor="#0A0704"         stopOpacity="0.96" />
          <stop offset="100%" stopColor="#0A0704"         stopOpacity="1" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${id})`}>
        {/* Schwarzer Hintergrund */}
        <rect x="0" y="0" width="900" height="320" fill="#0A0704" />

        {/* LINKER BLOCK — Poster, dunkler Hintergrund damit kein heller Streifen */}
        <rect x="0" y="0" width="300" height="320" fill="#2a1305" />
        <image
          href={POSTER_SRC}
          x="0" y="0" width="300" height="320"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Fließender Übergang Bild → schwarze Fläche */}
        <rect x="0" y="0" width="900" height="320" fill={`url(#fade-${id})`} />

        {/* 1 — "EMMERICH BOOMT!" */}
        <text
          x="370" y="80"
          fontFamily="'Lora', Georgia, serif"
          fontSize="13"
          letterSpacing="3"
          textAnchor="start"
          fill="#E8991A"
        >
          EMMERICH BOOMT!
        </text>

        {/* 2 — Name (dynamische Schriftgröße) */}
        <text
          x="370" y="142"
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
          x1="370" y1="166" x2="490" y2="166"
          stroke="#E8991A" strokeWidth="1.5" strokeOpacity="0.4"
        />

        {/* 4 — Datum + Einlass */}
        <text
          x="370" y="208"
          fontFamily="'Lora', Georgia, serif"
          fontSize="17"
          textAnchor="start"
          fill="#F5E8C8"
        >
          Samstag, 18. Juli 2026 · Einlass ab 19 Uhr
        </text>

        {/* 5 — Ort */}
        <text
          x="370" y="234"
          fontFamily="'Lora', Georgia, serif"
          fontSize="15"
          textAnchor="start"
          fill="#F5E8C8"
          fillOpacity="0.7"
        >
          Bölt / Kapaunenberg · Emmerich am Rhein
        </text>

        {/* 6 — Abreiß-Streifen rechts */}
        {/* Gestrichelte Trennlinie */}
        <line
          x1="840" y1="12" x2="840" y2="308"
          stroke="#E8991A" strokeWidth="1" strokeDasharray="3,5" strokeOpacity="0.45"
        />
        {/* Nummer + Label, vertikal, zentriert im Streifen */}
        <g transform="rotate(-90, 858, 160)">
          <text
            x="858" y="148"
            fontFamily="'Lora', Georgia, serif"
            fontSize="16"
            letterSpacing="3"
            textAnchor="middle"
            fill="#E8991A"
            fillOpacity="0.55"
          >
            EINTRITT
          </text>
          <text
            x="858" y="180"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="52"
            fontWeight="500"
            textAnchor="middle"
            fill="#E8991A"
          >
            № {numStr}
          </text>
        </g>

      </g>

      {/* Außenrahmen Amber */}
      <rect
        x="0.75" y="0.75" width="898.5" height="318.5"
        rx="6" ry="6"
        fill="none"
        stroke="#E8991A"
        strokeWidth="1.5"
      />
    </svg>
  );
}
