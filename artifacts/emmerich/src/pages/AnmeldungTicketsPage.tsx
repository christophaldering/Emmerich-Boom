import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

interface TicketEntry {
  name: string;
  nummer: string;
  code: string;
  usedAt: string | null;
}

interface AnmeldungTicketsData {
  tickets: TicketEntry[];
}

export default function AnmeldungTicketsPage({ code }: { code: string }) {
  const [data, setData] = useState<AnmeldungTicketsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/ticket/${code}/overview`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true));
  }, [code]);

  if (error) {
    return (
      <div style={sc.wrapper}>
        <p style={{ color: "#e8991a", fontFamily: "'Playfair Display', serif", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
          Keine Tickets für diese Anmeldung gefunden.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={sc.wrapper}>
        <p style={{ color: "#f5e8c8", fontFamily: "'Lora', serif", textAlign: "center", padding: "2rem", opacity: 0.5 }}>
          Lade…
        </p>
      </div>
    );
  }

  return (
    <div style={sc.wrapper}>
      <div style={sc.header}>
        <p style={sc.label}>EMMERICH BOOMT! · 18. Juli 2026</p>
        <h1 style={sc.headline}>
          {data.tickets.length === 1 ? "Dein Ticket" : `Alle ${data.tickets.length} Tickets`}
        </h1>
        <p style={sc.subline}>
          {data.tickets.length === 1
            ? "Hier kannst du dein Ticket herunterladen — als PDF zum Drucken oder als Bild fürs Handy."
            : "Hier kannst du alle Tickets auf einmal herunterladen oder die einzelnen Ticketseiten aufrufen."}
        </p>
      </div>

      <div style={sc.list}>
        {data.tickets.map(ticket => (
          <TicketRow key={ticket.code} ticket={ticket} />
        ))}
      </div>

      <p style={sc.hint}>
        Den QR-Code bitte am Einlass bereithalten.
      </p>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: TicketEntry }) {
  const ticketPageUrl = `${BASE}/boomer-orga-intern/ticket/${ticket.code}`;
  const pdfUrl = `${API}/ticket/${ticket.code}/download/pdf`;
  const pngUrl = `${API}/ticket/${ticket.code}/download/png`;

  return (
    <div style={sc.card}>
      <div style={sc.cardLeft}>
        <p style={sc.cardNummer}>#{ticket.nummer}</p>
        <p style={sc.cardName}>{ticket.name}</p>
        {ticket.usedAt && (
          <p style={sc.usedBadge}>
            ⚠️ Eingelöst um {new Date(ticket.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </p>
        )}
      </div>
      <div style={sc.cardActions}>
        <a href={ticketPageUrl} style={sc.btnPrimary}>
          Ticket ansehen
        </a>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={sc.btnSecondary}>
          PDF
        </a>
        <a href={pngUrl} target="_blank" rel="noopener noreferrer" style={sc.btnSecondary}>
          Bild
        </a>
      </div>
    </div>
  );
}

const sc: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100svh",
    background: "#0A0704",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem 1.5rem 4rem",
    gap: "2rem",
  },
  header: {
    width: "100%",
    maxWidth: "680px",
    textAlign: "center",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid rgba(232,153,26,0.2)",
  },
  label: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "0.7rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#E8991A",
    margin: "0 0 1rem",
    opacity: 0.8,
  },
  headline: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: "italic",
    fontSize: "2.2rem",
    fontWeight: 700,
    color: "#F5E8C8",
    margin: "0 0 0.75rem",
    lineHeight: 1.2,
  },
  subline: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "0.95rem",
    color: "rgba(245,232,200,0.65)",
    margin: 0,
    lineHeight: 1.7,
  },
  list: {
    width: "100%",
    maxWidth: "680px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1.25rem 1.5rem",
    border: "1px solid rgba(232,153,26,0.3)",
    borderRadius: "4px",
    background: "#120c04",
    flexWrap: "wrap" as const,
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: "120px",
  },
  cardNummer: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "0.72rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#E8991A",
    margin: 0,
    opacity: 0.75,
  },
  cardName: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: "italic",
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#F5E8C8",
    margin: 0,
    lineHeight: 1.2,
  },
  usedBadge: {
    fontFamily: "'Lora', Georgia, serif",
    fontStyle: "italic",
    fontSize: "0.75rem",
    color: "#e8991a",
    margin: "0.2rem 0 0",
  },
  cardActions: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  btnPrimary: {
    display: "inline-block",
    padding: "0.6rem 1.2rem",
    background: "#e8991a",
    borderRadius: "3px",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: "italic",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#0A0704",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },
  btnSecondary: {
    display: "inline-block",
    padding: "0.6rem 1rem",
    background: "transparent",
    border: "1px solid rgba(232,153,26,0.45)",
    borderRadius: "3px",
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "0.85rem",
    color: "#e8991a",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },
  hint: {
    fontFamily: "'Lora', Georgia, serif",
    fontStyle: "italic",
    fontSize: "0.82rem",
    color: "rgba(245,232,200,0.4)",
    margin: 0,
    textAlign: "center" as const,
  },
};
