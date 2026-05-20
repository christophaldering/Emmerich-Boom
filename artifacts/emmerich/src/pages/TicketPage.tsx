import { useEffect, useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const POSTER_SRC = `${BASE}/images/boomerpartyposter.jpeg`;

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

function nameFontSize(name: string): string {
  if (name.length > 22) return "1.5rem";
  if (name.length > 16) return "1.85rem";
  return "2.2rem";
}

export default function TicketPage({ code }: { code: string }) {
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [error, setError] = useState(false);
  const [pngLoading, setPngLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const captureBackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/ticket/${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setTicket)
      .catch(() => setError(true));
  }, [code]);

  const ticketUrl = `${window.location.origin}${BASE}/boomer-orga-intern/ticket/${code}`;

  async function handlePngDownload() {
    if (!captureRef.current || !ticket) return;
    setPngLoading(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#0A0704",
        logging: false,
      });
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-${ticket.ticketCode}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setPngLoading(false);
    }
  }

  async function handlePdfDownload() {
    if (!captureRef.current || !captureBackRef.current || !ticket) return;
    setPdfLoading(true);
    try {
      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(captureRef.current, { scale: 2, useCORS: true, backgroundColor: "#0A0704", logging: false }),
        html2canvas(captureBackRef.current, { scale: 2, useCORS: true, backgroundColor: "#fffdf8", logging: false }),
      ]);

      // Seite 1: Querformat A4 für das breite Ticket
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const lw = 297, lh = 210;
      const fr = frontCanvas.width / frontCanvas.height;
      const lr = lw / lh;
      let fw = lw, fh = lh;
      if (fr > lr) { fh = lw / fr; } else { fw = lh * fr; }
      pdf.addImage(frontCanvas.toDataURL("image/jpeg", 0.95), "JPEG", (lw - fw) / 2, (lh - fh) / 2, fw, fh);

      // Seite 2: Hochformat A4 für Rückseite
      pdf.addPage("a4", "portrait");
      const pw = 210, ph = 297;
      const br = backCanvas.width / backCanvas.height;
      const pr = pw / ph;
      let bw = pw, bh = ph;
      if (br > pr) { bh = pw / br; } else { bw = ph * br; }
      pdf.addImage(backCanvas.toDataURL("image/jpeg", 0.95), "JPEG", (pw - bw) / 2, (ph - bh) / 2, bw, bh);

      pdf.save(`ticket-${ticket.ticketCode}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  if (error) {
    return (
      <div style={sc.wrapper}>
        <p style={{ color: "#e8991a", fontFamily: "'Playfair Display', serif", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
          Ticket nicht gefunden.
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={sc.wrapper}>
        <p style={{ color: "#f5e8c8", fontFamily: "'Lora', serif", textAlign: "center", padding: "2rem", opacity: 0.5 }}>
          Lade…
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── SCREEN VIEW ── */}
      <div style={sc.wrapper} className="screen-only">
        <div style={sc.ticketOuter}>
          <EventimTicket ticket={ticket} ticketUrl={ticketUrl} />
        </div>

        {ticket.usedAt && (
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "#e8991a", textAlign: "center" }}>
            ⚠️ Bereits eingelöst um {new Date(ticket.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
          </p>
        )}

        <div style={sc.btnRow}>
          <button onClick={handlePngDownload} disabled={pngLoading} style={sc.btn}>
            {pngLoading ? "Wird erstellt…" : "Als Bild speichern"}
          </button>
          <button onClick={handlePdfDownload} disabled={pdfLoading} style={sc.btn}>
            {pdfLoading ? "Wird erstellt…" : "Als PDF speichern"}
          </button>
          <button onClick={() => window.print()} style={sc.btn}>
            Drucken
          </button>
        </div>
      </div>

      {/* ── HIDDEN CAPTURE (off-screen, für html2canvas) ── */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", zIndex: -1 }} aria-hidden="true">
        <div ref={captureRef} style={{ width: "900px", background: "#0A0704", borderRadius: "6px", overflow: "hidden" }}>
          <EventimTicketCapture ticket={ticket} ticketUrl={ticketUrl} />
        </div>
        <div ref={captureBackRef} style={{ width: "794px", height: "1123px", background: "#fffdf8", overflow: "hidden" }}>
          <TicketBack ticket={ticket} />
        </div>
      </div>

      {/* ── PRINT VIEW ── */}
      <div className="print-only">
        <div className="print-page print-landscape">
          <div style={{ width: "260mm", border: "1.5px solid #b37a14", borderRadius: "6px", overflow: "hidden" }}>
            <EventimTicketPrint ticket={ticket} ticketUrl={ticketUrl} />
          </div>
        </div>
        <div className="print-page print-portrait">
          <TicketBack ticket={ticket} />
        </div>
      </div>

      <style>{printStyles}</style>
    </>
  );
}

function EventimTicket({ ticket, ticketUrl }: { ticket: TicketInfo; ticketUrl: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 26%) 1fr auto", minHeight: "200px", background: "#0A0704" }}>
      {/* Poster */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={POSTER_SRC} alt="" crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #0A0704 100%)" }} />
      </div>

      {/* Mitte */}
      <div style={{ padding: "1.75rem 1.25rem 1.75rem 1.75rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.45rem" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#E8991A", margin: 0, opacity: 0.8 }}>
          EINTRITTSTICKET · EMMERICH BOOMT!
        </p>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: nameFontSize(ticket.personName), fontWeight: 700, color: "#E8991A", margin: 0, lineHeight: 1.1 }}>
          {ticket.personName}
        </p>
        <div style={{ width: "44px", height: "1.5px", background: "#E8991A", opacity: 0.35, margin: "0.3rem 0" }} />
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.88rem", color: "#F5E8C8", margin: 0, lineHeight: 1.6 }}>
          Samstag, 18. Juli 2026 · Beginn 20:00 Uhr
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.8rem", color: "#F5E8C8", margin: 0, opacity: 0.6 }}>
          Bölt / Kapaunenberg · Emmerich am Rhein
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.65rem", color: "#F5E8C8", margin: "0.6rem 0 0", opacity: 0.3, fontStyle: "italic" }}>
          Dieses Ticket ist personenbezogen und nicht übertragbar.
        </p>
      </div>

      {/* Abreiß-Streifen */}
      <div style={{ borderLeft: "1.5px dashed rgba(232,153,26,0.38)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.25rem 1rem", gap: "0.6rem", minWidth: "90px" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "#E8991A", opacity: 0.9, margin: 0, writingMode: "vertical-rl" as const, transform: "rotate(180deg)" }}>
          EINTRITT
        </p>
        <QRCodeSVG value={ticketUrl} size={76} bgColor="#0A0704" fgColor="#E8991A" level="M" />
        <p style={{ fontFamily: "monospace", fontSize: "0.48rem", color: "#E8991A", opacity: 0.65, margin: 0, letterSpacing: "0.05em", textAlign: "center" as const, wordBreak: "break-all" as const, maxWidth: "82px" }}>
          {ticket.ticketCode}
        </p>
      </div>
    </div>
  );
}

function EventimTicketCapture({ ticket, ticketUrl }: { ticket: TicketInfo; ticketUrl: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "252px 1fr 112px", height: "320px", background: "#0A0704" }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={POSTER_SRC} alt="" crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #0A0704 100%)" }} />
      </div>

      <div style={{ padding: "36px 24px 36px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase" as const, color: "#E8991A", margin: 0, opacity: 0.8 }}>
          EINTRITTSTICKET · EMMERICH BOOMT!
        </p>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "38px", fontWeight: 700, color: "#E8991A", margin: 0, lineHeight: 1.1 }}>
          {ticket.personName}
        </p>
        <div style={{ width: "48px", height: "1.5px", background: "#E8991A", opacity: 0.35, margin: "6px 0" }} />
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "15px", color: "#F5E8C8", margin: 0, lineHeight: 1.6 }}>
          Samstag, 18. Juli 2026 · Beginn 20:00 Uhr
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "13px", color: "#F5E8C8", margin: 0, opacity: 0.6 }}>
          Bölt / Kapaunenberg · Emmerich am Rhein
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "10px", color: "#F5E8C8", margin: "10px 0 0", opacity: 0.3, fontStyle: "italic" }}>
          Dieses Ticket ist personenbezogen und nicht übertragbar.
        </p>
      </div>

      <div style={{ borderLeft: "1.5px dashed rgba(232,153,26,0.38)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px 14px" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase" as const, color: "#E8991A", opacity: 0.9, margin: 0, writingMode: "vertical-rl" as const, transform: "rotate(180deg)" }}>
          EINTRITT
        </p>
        <QRCodeCanvas value={ticketUrl} size={68} bgColor="#0A0704" fgColor="#E8991A" level="M" />
        <p style={{ fontFamily: "monospace", fontSize: "8px", color: "#E8991A", opacity: 0.65, margin: 0, letterSpacing: "0.05em", textAlign: "center" as const, wordBreak: "break-all" as const }}>
          {ticket.ticketCode}
        </p>
      </div>
    </div>
  );
}

function EventimTicketPrint({ ticket, ticketUrl }: { ticket: TicketInfo; ticketUrl: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 108px", height: "290px", background: "#ffffff" }}>
      {/* Poster — bleibt farbig, braucht keine Tinte gespart */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={POSTER_SRC} alt="" crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, #ffffff 100%)" }} />
      </div>

      {/* Mitte — weiß mit dunkler Schrift */}
      <div style={{ padding: "32px 24px 32px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "7px", background: "#ffffff" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" as const, color: "#b37a14", margin: 0 }}>
          EINTRITTSTICKET · EMMERICH BOOMT!
        </p>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "36px", fontWeight: 700, color: "#1a1208", margin: 0, lineHeight: 1.1 }}>
          {ticket.personName}
        </p>
        <div style={{ width: "44px", height: "1.5px", background: "#b37a14", margin: "5px 0" }} />
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "14px", color: "#1a1208", margin: 0, lineHeight: 1.6 }}>
          Samstag, 18. Juli 2026 · Beginn 20:00 Uhr
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "12px", color: "#3a2e1e", margin: 0, opacity: 0.75 }}>
          Bölt / Kapaunenberg · Emmerich am Rhein
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "9px", color: "#3a2e1e", margin: "8px 0 0", opacity: 0.45, fontStyle: "italic" }}>
          Dieses Ticket ist personenbezogen und nicht übertragbar.
        </p>
      </div>

      {/* Abreiß-Streifen — weiß, QR schwarz auf weiß */}
      <div style={{ borderLeft: "1.5px dashed rgba(179,122,20,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px 14px", background: "#ffffff" }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase" as const, color: "#b37a14", margin: 0, writingMode: "vertical-rl" as const, transform: "rotate(180deg)" }}>
          EINTRITT
        </p>
        <QRCodeCanvas value={ticketUrl} size={68} bgColor="#ffffff" fgColor="#1a1208" level="M" />
        <p style={{ fontFamily: "monospace", fontSize: "7px", color: "#1a1208", margin: 0, letterSpacing: "0.05em", textAlign: "center" as const, wordBreak: "break-all" as const, opacity: 0.6 }}>
          {ticket.ticketCode}
        </p>
      </div>
    </div>
  );
}

function TicketBack({ ticket }: { ticket: TicketInfo }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fffdf8", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ height: "8mm", background: "#e8991a", flexShrink: 0 }} />
      <div style={{ flex: 1, padding: "14mm 18mm", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "#b37a14", letterSpacing: "0.05em", margin: "0 0 1.5rem", textTransform: "uppercase" as const }}>
          Gegründet 2024 – an der Theke der Nostalgie.
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", fontWeight: 700, color: "#1a1208", margin: "0 0 1.2rem", lineHeight: 1.2 }}>
          Wir freuen uns auf euch!
        </h2>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: "#3a2e1e", lineHeight: 1.75, margin: "0 0 1.8rem" }}>
          Liebes Geburtstagskind oder geladener Gast,<br />
          die Boomer-Party findet am <strong style={{ color: "#e8991a" }}>18. Juli 2026</strong> statt.
          Feiert mit uns an einem der schönsten Plätze Emmerichs — mit Musik, die man eigentlich schon vergessen haben sollte, Geschichten, die besser werden je später der Abend ist, und Gesellschaft, die man nicht kaufen kann.
        </p>
        <div style={{ display: "flex", gap: "3rem", marginBottom: "1.8rem", flexWrap: "wrap" as const }}>
          <div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#b37a14", margin: "0 0 0.3rem" }}>📍 Ort</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 600, color: "#1a1208", margin: 0, lineHeight: 1.5 }}>Kapaunenberg / Am Bölt<br />Emmerich am Rhein</p>
          </div>
          <div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#b37a14", margin: "0 0 0.3rem" }}>📅 Datum</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 600, color: "#1a1208", margin: 0, lineHeight: 1.5 }}>Samstag, 18. Juli 2026</p>
          </div>
        </div>
        <div style={{ height: "1px", background: "rgba(232,153,26,0.35)", margin: "0 0 1.5rem" }} />
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: "#7a6a50", lineHeight: 1.65, margin: 0 }}>
          Dieses Ticket gilt für eine Person: <strong style={{ color: "#e8991a" }}>{ticket.personName}</strong>.
          Es ist nicht übertragbar und verliert bei Weitergabe seine Gültigkeit.
          Beim Einlass wird der QR-Code gescannt.
        </p>
      </div>
      <div style={{ height: "8mm", background: "#e8991a", flexShrink: 0 }} />
    </div>
  );
}

const printStyles = `
  .print-only { display: none !important; }

  @media print {
    .screen-only { display: none !important; }
    .print-only { display: block !important; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-page {
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .print-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    .print-landscape {
      width: 297mm;
      height: 210mm;
      background: #ffffff;
    }
    .print-portrait {
      width: 210mm;
      height: 297mm;
      background: #fffdf8;
      align-items: stretch;
      justify-content: stretch;
    }
  }
`;

const sc: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100svh",
    background: "#1a1208",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem 1.5rem",
    gap: "1.5rem",
  },
  ticketOuter: {
    width: "100%",
    maxWidth: "860px",
    border: "1.5px solid #E8991A",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
  },
  btnRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
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
