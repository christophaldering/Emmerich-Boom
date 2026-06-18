import { BUILD_TIME_DE, BUILD_VERSION } from "../buildInfo";

export default function SiteFooter() {
  return (
    <>
      {/* ═══ Druckmaterial-Block ═══ */}
      <section
        style={{
          background: "rgba(232,153,26,0.07)",
          borderTop: "1px solid rgba(232,153,26,0.25)",
          borderBottom: "1px solid rgba(232,153,26,0.25)",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--amber)",
            opacity: 0.7,
            margin: "0 0 0.6rem",
          }}
        >
          Druckmaterial zum Weitersagen
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 3vw, 1.7rem)",
            color: "var(--fg)",
            margin: "0 0 0.5rem",
            lineHeight: 1.2,
          }}
        >
          Plakat &amp; Flyer
        </h2>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(0.82rem, 1.8vw, 0.95rem)",
            color: "var(--fg-70)",
            margin: "0 0 2rem",
            lineHeight: 1.7,
          }}
        >
          Einfach herunterladen, drucken und aufhängen — oder weiterschicken.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1.25rem",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          {/* Plakat */}
          <a
            href="/plakat"
            style={{
              flex: "1 1 240px",
              maxWidth: "280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.55rem",
              padding: "1.4rem 1.5rem 1.5rem",
              background: "rgba(232,153,26,0.09)",
              border: "1.5px solid rgba(232,153,26,0.45)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(232,153,26,0.18)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,153,26,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(232,153,26,0.09)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,153,26,0.45)";
            }}
          >
            {/* Plakat-Icon */}
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2" y="2" width="32" height="40" rx="2" stroke="#E8991A" strokeWidth="2" fill="none"/>
              <rect x="7" y="8" width="22" height="3" rx="1.5" fill="#E8991A" opacity="0.9"/>
              <rect x="7" y="15" width="22" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="7" y="20" width="16" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="7" y="30" width="22" height="7" rx="1.5" fill="#E8991A" opacity="0.3"/>
            </svg>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "var(--amber)",
              }}
            >
              Plakat
            </div>
            <div
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.8rem",
                color: "var(--fg-70)",
                lineHeight: 1.55,
                textAlign: "center",
              }}
            >
              Druckfertig in den Formaten<br />A0 · A1 · A2 · A3 · A4 · A5
            </div>
          </a>

          {/* Flyer */}
          <a
            href="/flyer"
            style={{
              flex: "1 1 240px",
              maxWidth: "280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.55rem",
              padding: "1.4rem 1.5rem 1.5rem",
              background: "rgba(232,153,26,0.09)",
              border: "1.5px solid rgba(232,153,26,0.45)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(232,153,26,0.18)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,153,26,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(232,153,26,0.09)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,153,26,0.45)";
            }}
          >
            {/* Flyer-Icon: Querformat + Falzlinie */}
            <svg width="48" height="34" viewBox="0 0 48 34" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2" y="2" width="44" height="30" rx="2" stroke="#E8991A" strokeWidth="2" fill="none"/>
              <line x1="24" y1="2" x2="24" y2="32" stroke="#E8991A" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
              <rect x="6" y="7" width="14" height="3" rx="1.5" fill="#E8991A" opacity="0.9"/>
              <rect x="6" y="13" width="14" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="6" y="18" width="10" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="28" y="7" width="14" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="28" y="12" width="14" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
              <rect x="28" y="17" width="10" height="2" rx="1" fill="#E8991A" opacity="0.5"/>
            </svg>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "var(--amber)",
              }}
            >
              Flyer
            </div>
            <div
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.8rem",
                color: "var(--fg-70)",
                lineHeight: 1.55,
                textAlign: "center",
              }}
            >
              A4 Querformat · Mittelfaltung<br />4 Seiten · beidseitig drucken
            </div>
          </a>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer
        style={{
          textAlign: "center",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
          lineHeight: 2.0,
          color: "var(--fg-90)",
          padding: "2.5rem 2rem 2rem",
        }}
      >
        <p>Emmerich boomt! · BoomerParty · 18. Juli 2026 (Uhrzeit wird noch bekanntgegeben) · Bölt, Emmerich am Rhein</p>
        <p>Eine Veranstaltung des BoomerClub Emmerich · Geboren 2024 — an der Theke der Societät.</p>
        <p style={{ color: "var(--amber)", opacity: 0.85 }}>Von uns. Für uns. Wird Zeit. — Das BoomerParty-OrgaTeam</p>
      </footer>

      {/* Made-by + Datum */}
      <div style={{ textAlign: "center", padding: "0 1rem 2.5rem" }}>
        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: "10px",
          color: "rgba(245,232,200,0.4)",
          margin: "0 0 4px",
        }}>
          Gemacht in Emmerich. Mit Liebe und einem Bier.
        </p>
        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: "10px",
          color: "rgba(245,232,200,0.4)",
          margin: 0,
        }}>
          Zuletzt aktualisiert: {BUILD_TIME_DE} · {BUILD_VERSION}
        </p>
      </div>
    </>
  );
}
