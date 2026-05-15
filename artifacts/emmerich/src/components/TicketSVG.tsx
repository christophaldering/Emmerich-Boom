const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const POSTER_SRC = `${BASE}/images/boomerpartyposter.jpeg`;

interface TicketSVGProps {
  name: string;
  nummer: number;
}

export default function TicketSVG({ name, nummer }: TicketSVGProps) {
  const id = `t${nummer}`;
  const numStr = String(nummer).padStart(3, "0");

  return (
    <svg
      viewBox="0 0 842 595"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label={`Ticket ${numStr} — ${name}`}
    >
      <defs>
        {/* Clip entire ticket to rounded corners */}
        <clipPath id={`clip-${id}`}>
          <rect x="0" y="0" width="842" height="595" rx="6" ry="6" />
        </clipPath>
        {/* Clip middle text block so it never bleeds into the stub */}
        <clipPath id={`mid-${id}`}>
          <rect x="320" y="0" width="308" height="595" />
        </clipPath>
        {/* Poster fade: transparent left → black right */}
        <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#0A0704" stopOpacity="0" />
          <stop offset="55%"  stopColor="#0A0704" stopOpacity="0" />
          <stop offset="100%" stopColor="#0A0704" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* === All visible content clipped to rounded rect === */}
      <g clipPath={`url(#clip-${id})`}>

        {/* Background */}
        <rect x="0" y="0" width="842" height="595" fill="#0A0704" />

        {/* LEFT BLOCK — Poster-Streifen */}
        <image
          href={POSTER_SRC}
          x="0" y="0" width="295" height="595"
          preserveAspectRatio="xMidYMid slice"
        />
        {/* Fade overlay: volle Transparenz links → Schwarz rechts */}
        <rect x="0" y="0" width="295" height="595" fill={`url(#fade-${id})`} />

        {/* MIDDLE BLOCK — Event-Infos */}
        <g clipPath={`url(#mid-${id})`}>
          {/* "EMMERICH BOOMT!" Label */}
          <text
            x="330" y="206"
            fontFamily="'Lora', Georgia, serif"
            fontSize="12"
            letterSpacing="3"
            textAnchor="start"
            fill="#E8991A"
          >
            EMMERICH BOOMT!
          </text>

          {/* Name */}
          <text
            x="330" y="263"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="48"
            fontWeight="500"
            textAnchor="start"
            fill="#E8991A"
          >
            {name}
          </text>

          {/* Trennlinie */}
          <line
            x1="330" y1="283" x2="450" y2="283"
            stroke="#E8991A" strokeWidth="1.5" strokeOpacity="0.4"
          />

          {/* Datum */}
          <text
            x="330" y="319"
            fontFamily="'Lora', Georgia, serif"
            fontSize="16"
            textAnchor="start"
            fill="#F5E8C8"
          >
            Samstag, 18. Juli 2026
          </text>

          {/* Einlass */}
          <text
            x="330" y="343"
            fontFamily="'Lora', Georgia, serif"
            fontSize="16"
            textAnchor="start"
            fill="#F5E8C8"
            fillOpacity="0.7"
          >
            Einlass ab 19 Uhr
          </text>

          {/* Ort 1 */}
          <text
            x="330" y="370"
            fontFamily="'Lora', Georgia, serif"
            fontSize="14"
            textAnchor="start"
            fill="#F5E8C8"
            fillOpacity="0.7"
          >
            Bölt / Kapaunenberg
          </text>

          {/* Ort 2 */}
          <text
            x="330" y="391"
            fontFamily="'Lora', Georgia, serif"
            fontSize="14"
            textAnchor="start"
            fill="#F5E8C8"
            fillOpacity="0.7"
          >
            Emmerich am Rhein
          </text>
        </g>

        {/* Gestrichelte Trennlinie zwischen Mittelblock und Stub */}
        <line
          x1="631" y1="20" x2="631" y2="575"
          stroke="#E8991A" strokeWidth="1" strokeDasharray="2,4" strokeOpacity="0.6"
        />

        {/* RIGHT BLOCK — Abriss-Stub */}
        {/* "EINTRITT" */}
        <text
          x="737" y="211"
          fontFamily="'Lora', Georgia, serif"
          fontSize="12"
          letterSpacing="2.5"
          textAnchor="middle"
          fill="#E8991A"
        >
          EINTRITT
        </text>

        {/* № Symbol */}
        <text
          x="737" y="274"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="28"
          textAnchor="middle"
          fill="#E8991A"
          fillOpacity="0.6"
        >
          №
        </text>

        {/* Laufende Nummer */}
        <text
          x="737" y="364"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="80"
          fontWeight="500"
          textAnchor="middle"
          fill="#E8991A"
        >
          {numStr}
        </text>

        {/* "EB · 2026" */}
        <text
          x="737" y="398"
          fontFamily="'Lora', Georgia, serif"
          fontSize="12"
          letterSpacing="2"
          textAnchor="middle"
          fill="#F5E8C8"
          fillOpacity="0.5"
        >
          EB · 2026
        </text>

      </g>

      {/* Amber border on top of content */}
      <rect
        x="0.75" y="0.75" width="840.5" height="593.5"
        rx="6" ry="6"
        fill="none"
        stroke="#E8991A"
        strokeWidth="1.5"
      />
    </svg>
  );
}
