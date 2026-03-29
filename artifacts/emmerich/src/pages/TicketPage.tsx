import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

interface TicketInfo {
  id: number;
  personName: string;
  ticketCode: string;
  paymentMethod: string | null;
  paidAt: string | null;
  usedAt: string | null;
  createdAt: string;
  registrationName: string | null;
}

export default function TicketPage({ code }: { code: string }) {
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/ticket/${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setTicket)
      .catch(() => setError(true));
  }, [code]);

  const ticketUrl = `${window.location.origin}${BASE}/boomer-orga-intern/ticket/${code}`;

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ color: "#e8991a", fontFamily: "'Playfair Display', serif", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
            Ticket nicht gefunden.
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ color: "#f5e8c8", fontFamily: "'Lora', serif", textAlign: "center", padding: "2rem", opacity: 0.5 }}>
            Lade…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── SCREEN VIEW ── */}
      <div style={styles.wrapper} className="screen-only">
        <div style={styles.card}>
          <TicketFront ticket={ticket} ticketUrl={ticketUrl} />
        </div>
        <button onClick={() => window.print()} style={styles.printBtn}>
          Ticket drucken / als PDF speichern
        </button>
      </div>

      {/* ── PRINT VIEW ── hidden on screen, visible only when printing ── */}
      <div className="print-only">
        {/* Page 1 – Vorderseite */}
        <div className="print-page print-front">
          <div className="print-ticket-card">
            <TicketFront ticket={ticket} ticketUrl={ticketUrl} />
          </div>
        </div>

        {/* Page 2 – Rückseite */}
        <div className="print-page print-back">
          <TicketBack ticket={ticket} />
        </div>
      </div>

      <style>{printStyles}</style>
    </>
  );
}

function TicketFront({ ticket, ticketUrl }: { ticket: TicketInfo; ticketUrl: string }) {
  return (
    <>
      <div style={styles.header}>
        <p style={styles.label}>EINTRITTSTICKET</p>
        <h1 style={styles.eventTitle}>EMMERICH BOOMT!</h1>
        <p style={styles.subtitle}>BoomerParty · 18. Juli 2026</p>
        <p style={styles.location}>Kapaunenberg / Am Bölt · Emmerich am Rhein</p>
      </div>

      <div style={styles.divider} />

      <div style={styles.personSection}>
        <p style={styles.personLabel}>EINTRITTSBERECHTIGT</p>
        <p style={styles.personName}>{ticket.personName}</p>
      </div>

      <div style={styles.divider} />

      <div style={styles.qrSection}>
        <QRCodeSVG
          value={ticketUrl}
          size={160}
          bgColor="#0a0704"
          fgColor="#e8991a"
          level="M"
        />
        <p style={styles.ticketCode}>{ticket.ticketCode}</p>
        <p style={styles.codeHint}>Bitte beim Einlass vorzeigen</p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>Dieses Ticket ist personenbezogen und nicht übertragbar.</p>
        {ticket.usedAt && (
          <p style={{ ...styles.footerText, color: "#e8991a", marginTop: "0.5rem" }}>
            ⚠️ Bereits eingelöst um {new Date(ticket.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </p>
        )}
      </div>
    </>
  );
}

function TicketBack({ ticket }: { ticket: TicketInfo }) {
  return (
    <div style={backStyles.page}>
      {/* Gold accent bar top */}
      <div style={backStyles.accentBar} />

      <div style={backStyles.content}>
        <p style={backStyles.tagline}>Gegründet 2024 – an der Theke der Nostalgie.</p>

        <h2 style={backStyles.heading}>Wir freuen uns auf euch!</h2>

        <p style={backStyles.body}>
          Liebes Geburtstagskind oder geladener Gast,<br />
          die Boomer-Party findet am <strong style={{ color: "#e8991a" }}>18. Juli 2026</strong> statt.
          Feiert mit uns an einem der schönsten Plätze Emmerichs — mit Musik, die man eigentlich schon vergessen haben sollte, Geschichten, die besser werden je später der Abend ist, und Gesellschaft, die man nicht kaufen kann.
        </p>

        <div style={backStyles.infoGrid}>
          <div style={backStyles.infoBlock}>
            <p style={backStyles.infoLabel}>📍 Ort</p>
            <p style={backStyles.infoValue}>Kapaunenberg / Am Bölt<br />Emmerich am Rhein</p>
          </div>
          <div style={backStyles.infoBlock}>
            <p style={backStyles.infoLabel}>📅 Datum</p>
            <p style={backStyles.infoValue}>Samstag, 18. Juli 2026</p>
          </div>
        </div>

        <div style={backStyles.divider} />

        <p style={backStyles.smallPrint}>
          Dieses Ticket gilt für eine Person: <strong style={{ color: "#e8991a" }}>{ticket.personName}</strong>.
          Es ist nicht übertragbar und verliert bei Weitergabe seine Gültigkeit.
          Beim Einlass wird der QR-Code auf der Vorderseite gescannt.
        </p>
      </div>

      {/* Gold accent bar bottom */}
      <div style={backStyles.accentBar} />
    </div>
  );
}

const printStyles = `
  /* ── Screen: hide print-only blocks ── */
  .print-only { display: none !important; }

  /* ── Print: hide screen-only blocks, show print layout ── */
  @media print {
    .screen-only { display: none !important; }

    .print-only {
      display: block !important;
    }

    /* Force portrait A4, no margins (we control them inside) */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Each page is exactly one A4 sheet */
    .print-page {
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Last page – no trailing break */
    .print-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Front page: dark background, ticket card centered */
    .print-front {
      background: #1a1208;
    }

    .print-ticket-card {
      background: #0a0704;
      border: 2px solid #e8991a;
      border-radius: 8px;
      width: 148mm;
      overflow: hidden;
    }

    /* Back page: white/cream */
    .print-back {
      background: #fffdf8;
      align-items: stretch;
      justify-content: stretch;
    }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100svh",
    background: "#1a1208",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    gap: "1.5rem",
  },
  card: {
    background: "#0a0704",
    border: "2px solid #e8991a",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
  },
  header: {
    background: "#e8991a",
    padding: "1.5rem 1.5rem 1rem",
    textAlign: "center",
  },
  label: {
    fontFamily: "'Lora', serif",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    color: "#0a0704",
    margin: "0 0 0.5rem",
    opacity: 0.7,
  },
  eventTitle: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#0a0704",
    margin: "0 0 0.25rem",
    lineHeight: 1.1,
  },
  subtitle: {
    fontFamily: "'Lora', serif",
    fontSize: "0.9rem",
    color: "#0a0704",
    margin: "0 0 0.25rem",
    fontWeight: 600,
  },
  location: {
    fontFamily: "'Lora', serif",
    fontSize: "0.78rem",
    color: "#0a0704",
    margin: 0,
    opacity: 0.8,
  },
  divider: {
    height: "1px",
    background: "rgba(232,153,26,0.3)",
    margin: "0 1.5rem",
  },
  personSection: {
    padding: "1.25rem 1.5rem",
    textAlign: "center",
  },
  personLabel: {
    fontFamily: "'Lora', serif",
    fontSize: "0.65rem",
    letterSpacing: "0.15em",
    color: "rgba(245,232,200,0.5)",
    margin: "0 0 0.4rem",
  },
  personName: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1.5rem",
    color: "#f5e8c8",
    margin: 0,
    fontWeight: 600,
  },
  qrSection: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  },
  ticketCode: {
    fontFamily: "monospace",
    fontSize: "1.1rem",
    color: "#e8991a",
    letterSpacing: "0.15em",
    margin: 0,
  },
  codeHint: {
    fontFamily: "'Lora', serif",
    fontStyle: "italic",
    fontSize: "0.75rem",
    color: "rgba(245,232,200,0.5)",
    margin: 0,
  },
  footer: {
    padding: "1rem 1.5rem",
    background: "rgba(232,153,26,0.05)",
    borderTop: "1px solid rgba(232,153,26,0.15)",
    textAlign: "center",
  },
  footerText: {
    fontFamily: "'Lora', serif",
    fontStyle: "italic",
    fontSize: "0.72rem",
    color: "rgba(245,232,200,0.4)",
    margin: 0,
  },
  printBtn: {
    background: "transparent",
    border: "1px solid #e8991a",
    borderRadius: "4px",
    color: "#e8991a",
    padding: "0.75rem 1.5rem",
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

const backStyles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100%",
    background: "#fffdf8",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  accentBar: {
    height: "8mm",
    background: "#e8991a",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: "14mm 18mm",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0",
  },
  tagline: {
    fontFamily: "'Lora', serif",
    fontStyle: "italic",
    fontSize: "0.75rem",
    color: "#b37a14",
    letterSpacing: "0.05em",
    margin: "0 0 1.5rem",
    textTransform: "uppercase" as const,
  },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: "italic",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1a1208",
    margin: "0 0 1.2rem",
    lineHeight: 1.2,
  },
  body: {
    fontFamily: "'Lora', serif",
    fontSize: "0.95rem",
    color: "#3a2e1e",
    lineHeight: 1.75,
    margin: "0 0 1.8rem",
  },
  infoGrid: {
    display: "flex",
    gap: "3rem",
    marginBottom: "1.8rem",
    flexWrap: "wrap" as const,
  },
  infoBlock: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3rem",
  },
  infoLabel: {
    fontFamily: "'Lora', serif",
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#b37a14",
    margin: 0,
  },
  infoValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#1a1208",
    margin: 0,
    lineHeight: 1.5,
  },
  divider: {
    height: "1px",
    background: "rgba(232,153,26,0.35)",
    margin: "0 0 1.5rem",
  },
  smallPrint: {
    fontFamily: "'Lora', serif",
    fontStyle: "italic",
    fontSize: "0.8rem",
    color: "#7a6a50",
    lineHeight: 1.65,
    margin: 0,
  },
};
