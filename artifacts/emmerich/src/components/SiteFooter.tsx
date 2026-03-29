export default function SiteFooter() {
  return (
    <footer
      style={{
        textAlign: "center",
        fontFamily: "'Lora', serif",
        fontStyle: "italic",
        fontSize: "1rem",
        lineHeight: 2.0,
        color: "var(--fg-90)",
        padding: "2.5rem 2rem 3rem",
        borderTop: "1px solid var(--fg-20)",
      }}
    >
      <p>Emmerich boomt! · BoomerParty · 18. Juli 2026 (Uhrzeit wird noch bekanntgegeben) · Bölt, Emmerich am Rhein</p>
      <p>Eine Veranstaltung des BoomerClub Emmerich · Geboren 2024 - an der Theke der Societät.</p>
      <p style={{ color: "var(--amber)", opacity: 0.85 }}>Von uns. Für uns. Wird Zeit. — Das BoomerParty-OrgaTeam</p>
    </footer>
  );
}
