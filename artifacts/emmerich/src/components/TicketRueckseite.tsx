export default function TicketRueckseite() {
  return (
    <svg
      viewBox="0 0 900 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="Ticket Rückseite"
    >
      {/* Hintergrund */}
      <rect x="0" y="0" width="900" height="340" fill="#0A0704" />

      {/* ── BLOCK 1: Was dich erwartet (oben, y 24–115) ── */}
      <text
        x="32" y="50"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="14"
        letterSpacing="3"
        fill="#E8991A"
      >
        WAS DICH ERWARTET
      </text>

      <foreignObject x="32" y="60" width="580" height="56">
        <body style={{ margin: 0, padding: 0 }}>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "12px",
            color: "#F5E8C8",
            lineHeight: "1.65",
            margin: 0,
          }}>
            Ein Abend, an dem niemand sein Handy braucht, um sich zu erinnern, wie alles war.
            Niemand sagt "wir müssen los", bevor es 23 Uhr ist. Und niemand bestellt einen Aperol Spritz.
          </p>
        </body>
      </foreignObject>

      {/* Trennlinie Block 1 → 2 */}
      <line x1="32" y1="122" x2="868" y2="122" stroke="#E8991A" strokeWidth="0.8" strokeOpacity="0.25" />

      {/* ── BLOCK 2: Hausregeln (Mitte, y 130–270) ── */}
      <text
        x="32" y="148"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="14"
        letterSpacing="3"
        fill="#E8991A"
      >
        HAUSREGELN
      </text>

      {/* § 1 */}
      <text x="32" y="170" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#E8991A" fontWeight="600">§ 1</text>
      <text x="58" y="170" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        Mitbringen erwünscht: gute Laune, ein paar Geschichten, der Song, den du auf der Anmeldung genannt hast.
      </text>

      {/* § 2 */}
      <text x="32" y="186" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#E8991A" fontWeight="600">§ 2</text>
      <text x="58" y="186" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        Mitbringen unerwünscht: Kinder unter 25, sofern nicht volljährig.
      </text>

      {/* § 3 */}
      <text x="32" y="202" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#E8991A" fontWeight="600">§ 3</text>
      <text x="58" y="202" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        Die Veranstalter haften nicht für: Heiserkeit am nächsten Morgen, peinliche Tanzeinlagen,
      </text>
      <text x="58" y="215" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        plötzliche Erinnerungen an die 80er.
      </text>

      {/* § 4 */}
      <text x="32" y="231" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#E8991A" fontWeight="600">§ 4</text>
      <text x="58" y="231" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        Der Spruch "Das hätte es früher nicht gegeben" gilt als Begrüßung.
      </text>

      {/* § 5 */}
      <text x="32" y="247" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#E8991A" fontWeight="600">§ 5</text>
      <text x="58" y="247" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        Tickets sind personalisiert. Ein Tausch innerhalb des Haushalts ist erlaubt, ein Verkauf bei eBay
      </text>
      <text x="58" y="260" fontFamily="'Lora', Georgia, serif" fontSize="10" fill="#F5E8C8">
        verboten und vermutlich auch nicht lohnend.
      </text>

      {/* Trennlinie Block 2 → 3 */}
      <line x1="32" y1="272" x2="868" y2="272" stroke="#E8991A" strokeWidth="1" strokeOpacity="0.4" />

      {/* ── BLOCK 3: Veranstalter-Footer (unten, y 278–330) ── */}
      <text
        x="32" y="290"
        fontFamily="'Lora', Georgia, serif"
        fontSize="10"
        fill="#F5E8C8"
      >
        Veranstalter: BoomerClub Emmerich · Ein loser Zusammenschluss von Menschen, die sich seit Karneval 2024
      </text>
      <text
        x="32" y="303"
        fontFamily="'Lora', Georgia, serif"
        fontSize="10"
        fill="#F5E8C8"
      >
        an der Theke der Sozietät kennen.
      </text>
      <text
        x="32" y="320"
        fontFamily="'Lora', Georgia, serif"
        fontSize="10"
        fill="#F5E8C8"
        fillOpacity="0.7"
      >
        Kontakt: boomerparty26@emmerich-boomt.de · www.emmerich-boomt.de
      </text>

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
