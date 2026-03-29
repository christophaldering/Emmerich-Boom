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

  const ticketUrl = `${window.location.origin}${BASE}/ticket/${code}`;

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ color: "#e8991a", fontFamily: "'Playfair Display', serif", fontStyle: "italic", textAlign: "center" }}>
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
          <p style={{ color: "#f5e8c8", fontFamily: "'Lora', serif", textAlign: "center", opacity: 0.5 }}>
            Lade…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} className="ticket-print-card">
        {/* Header */}
        <div style={styles.header}>
          <p style={styles.label}>EINTRITTSTICKET</p>
          <h1 style={styles.eventTitle}>EMMERICH BOOMT!</h1>
          <p style={styles.subtitle}>BoomerParty · 18. Juli 2026</p>
          <p style={styles.location}>Kapaunenberg / Am Bölt · Emmerich am Rhein</p>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Person */}
        <div style={styles.personSection}>
          <p style={styles.personLabel}>EINTRITTSBERECHTIGT</p>
          <p style={styles.personName}>{ticket.personName}</p>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* QR + Code */}
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

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Dieses Ticket ist personenbezogen und nicht übertragbar.</p>
          {ticket.usedAt && (
            <p style={{ ...styles.footerText, color: "#e8991a", marginTop: "0.5rem" }}>
              ⚠️ Bereits eingelöst um {new Date(ticket.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
            </p>
          )}
        </div>
      </div>

      {/* Print button (hidden when printing) */}
      <button
        onClick={() => window.print()}
        className="no-print"
        style={styles.printBtn}
      >
        Ticket drucken / als PDF speichern
      </button>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .ticket-print-card {
            border: 2px solid #0a0704 !important;
            box-shadow: none !important;
          }
        }
        @page { margin: 1cm; size: A5; }
      `}</style>
    </div>
  );
}

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
