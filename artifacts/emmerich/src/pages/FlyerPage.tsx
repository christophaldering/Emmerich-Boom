import { QRCodeSVG } from "qrcode.react";

const SITE_URL = "https://emmerich-boomt.replit.app";

const A  = "#E8991A";
const A2 = "#c97d10";
const BG = "#0a0704";
const FG = "#f5e8c8";

export default function FlyerPage() {
  return (
    <div className="flyer-page" style={{ background: "#1a1208", minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "2rem" }}>

      {/* Controls */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
        <button onClick={() => window.print()} style={{
          background: A, border: "none", borderRadius: "4px",
          color: BG, padding: "0.7rem 2.5rem",
          fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.05rem", cursor: "pointer",
        }}>
          Flyer drucken / als PDF speichern
        </button>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: "rgba(245,232,200,0.4)", margin: 0, textAlign: "center" }}>
          Druckdialog: Papierformat A4 · Querformat · Ränder auf „Keine" · beidseitig drucken · in der Mitte falten
        </p>
      </div>

      {/* Seite A: Außenseite */}
      <div className="print-label no-print" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,232,200,0.35)", alignSelf: "flex-start", marginLeft: "2vw" }}>
        Seite A — Außenseite drucken (Seite 1 & 4)
      </div>
      <Aussen />

      {/* Seite B: Innenseite */}
      <div className="print-label no-print" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,232,200,0.35)", alignSelf: "flex-start", marginLeft: "2vw" }}>
        Seite B — Innenseite drucken (Seite 2 & 3)
      </div>
      <Innen />

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body, html { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .no-print { display: none !important; }
          .flyer-page {
            background: #fff !important;
            padding: 0 !important;
            gap: 0 !important;
            min-height: 0 !important;
            display: block !important;
          }
          .flyer-spread {
            box-shadow: none !important;
            width: 100% !important;
            height: 100vh !important;
            aspect-ratio: auto !important;
            page-break-after: always;
            break-after: page;
          }

          /* Seite 4 — Absender */
          .panel-sender { background: #fff !important; }
          .panel-sender .p-label  { color: ${A2} !important; opacity: 1 !important; }
          .panel-sender .p-heading { color: ${A2} !important; }
          .panel-sender .p-body   { color: #1a0e04 !important; opacity: 1 !important; }
          .panel-sender .p-url    { color: ${A2} !important; opacity: 1 !important; }

          /* Seite 2 */
          .panel-left { background: #fff !important; border-right: 1px dashed #ccc; }
          .panel-left .p-label   { color: ${A2} !important; opacity: 1 !important; }
          .panel-left .p-heading  { color: ${A2} !important; }
          .panel-left .p-body    { color: #1a0e04 !important; opacity: 1 !important; }
          .panel-left .p-italic  { color: #1a0e04 !important; opacity: 0.6 !important; }

          /* Seite 3 */
          .panel-right { background: #fff !important; }
          .panel-right .p-label      { color: ${A2} !important; opacity: 1 !important; }
          .panel-right .p-heading     { color: ${A2} !important; }
          .panel-right .p-step-num   { color: ${A2} !important; }
          .panel-right .p-step-title { color: #1a0e04 !important; }
          .panel-right .p-step-text  { color: #3a2a0a !important; opacity: 1 !important; }
          .panel-right .p-qr-box     { background: #f7f0e0 !important; border: 1px solid #e0c88a !important; }
          .panel-right .p-qr-label   { color: ${A2} !important; }
          .panel-right .p-qr-url     { color: #3a2a0a !important; opacity: 1 !important; }

          .faltlinie { background: repeating-linear-gradient(to bottom, #bbb 0px, #bbb 6px, transparent 6px, transparent 12px) !important; }
        }
      `}</style>
    </div>
  );
}

/* ── AUSSENSEITE: Seite 4 (links) + Seite 1 (rechts) ── */
function Aussen() {
  return (
    <div className="flyer-spread" style={spreadStyle}>
      {/* Seite 4 — Absender */}
      <div className="panel-sender" style={{ ...panelStyle, background: BG, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "8% 7%" }}>
        <div>
          <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.45rem, 1.1vw, 0.8rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: "0 0 0.6em", opacity: 0.8 }}>
            Absender
          </p>
          <div className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1rem, 2.8vw, 2rem)", color: A, lineHeight: 1.1 }}>
            BoomerClub<br />Emmerich
          </div>
        </div>
        <div>
          <p className="p-body" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.5rem, 1.15vw, 0.85rem)", color: FG, lineHeight: 1.7, opacity: 0.85, margin: 0 }}>
            Gegründet 2024 — an der Theke der Societät. Rund 130 Mitglieder aus Emmerich und Umgebung.
            Eine Community für alle, die dabei sein wollen — bei gemütlichen Treffen oder einfach per WhatsApp.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <div style={{ background: "#fff", padding: "clamp(2px, 0.5%, 6px)", borderRadius: "4px", lineHeight: 0, flexShrink: 0 }}>
            <QRCodeSVG value={SITE_URL} size={256} bgColor="#fff" fgColor={BG} level="M"
              style={{ width: "clamp(28px, 6vw, 52px)", height: "auto", display: "block" }} />
          </div>
          <p className="p-url" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.42rem, 0.95vw, 0.75rem)", color: A, margin: 0, lineHeight: 1.4, opacity: 0.9 }}>
            emmerich-boomt<br />.replit.app
          </p>
        </div>
      </div>

      <div className="faltlinie" style={{ width: "1px", flexShrink: 0, background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 6px, transparent 6px, transparent 12px)", alignSelf: "stretch" }} />

      {/* Seite 1 — Deckblatt */}
      <div style={{ ...panelStyle, background: "#E8891A", position: "relative", overflow: "hidden" }}>
        <svg viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25, zIndex: 0, pointerEvents: "none" }} preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * 360; const r = (a * Math.PI) / 180;
            const aN = ((i + 0.5) / 20) * 360; const rN = (aN * Math.PI) / 180;
            return <polygon key={i} points={`500,500 ${500 + Math.cos(r) * 1500},${500 + Math.sin(r) * 1500} ${500 + Math.cos(rN) * 1500},${500 + Math.sin(rN) * 1500}`} fill={i % 2 === 0 ? "#fff" : "#c97d10"} />;
          })}
        </svg>
        <img src="/boomerparty-foto.jpeg" alt="BoomerParty"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, background: "linear-gradient(to bottom, rgba(232,137,26,0.95) 55%, rgba(232,137,26,0))", padding: "5% 5% 12%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.2rem, 5.5vw, 4rem)", lineHeight: 0.88, color: "#fff", textShadow: "3px 4px 0 rgba(0,0,0,0.2)", textTransform: "uppercase" }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.5rem, 1.6vw, 1.1rem)", color: "#0a0704", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "3%", opacity: 0.85 }}>
            Die BoomerParty
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, background: "linear-gradient(to top, rgba(160,85,5,0.95) 55%, rgba(160,85,5,0))", padding: "10% 5% 5%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(0.7rem, 2.2vw, 1.55rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.2 }}>
            Samstag, 18. Juli 2026
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.5rem, 1.4vw, 0.95rem)", color: "#fff", opacity: 0.9, marginTop: "2%" }}>
            Bölt / Kapaunenberg · Emmerich am Rhein
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── INNENSEITE: Seite 2 (links) + Seite 3 (rechts) ── */
function Innen() {
  return (
    <div className="flyer-spread" style={spreadStyle}>
      {/* Seite 2 */}
      <div className="panel-left" style={{ ...panelStyle, background: "#1a0e04", display: "flex", flexDirection: "column", justifyContent: "center", padding: "8% 7%", gap: "1.2em" }}>
        <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: 0, opacity: 0.8 }}>
          Was ist das hier eigentlich?
        </p>
        <h2 className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(0.9rem, 2.6vw, 1.85rem)", color: A, lineHeight: 1.15, margin: 0 }}>
          Alter Wein, neue Schläuche — und sehr gute Mucke.
        </h2>
        <div className="p-body" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.5rem, 1.15vw, 0.85rem)", color: FG, lineHeight: 1.8, opacity: 0.88 }}>
          <p style={{ margin: "0 0 0.8em" }}>
            Der BoomerClub Emmerich veranstaltet am 18. Juli 2026 die erste BoomerParty — eine Sommerparty für alle, die mit den Hits der 70er, 80er und 90er aufgewachsen sind.
          </p>
          <p style={{ margin: "0 0 0.8em" }}>
            Kein Konzert, keine Vorlesung, kein Programm. Einfach ein richtig guter Abend draußen: alte Bekannte wiedersehen, neue kennenlernen, reden, lachen, tanzen.
          </p>
          <p className="p-italic" style={{ margin: 0, fontStyle: "italic", opacity: 0.75 }}>
            Von uns. Für uns. Wird Zeit.
          </p>
        </div>
      </div>

      <div className="faltlinie" style={{ width: "1px", flexShrink: 0, background: "repeating-linear-gradient(to bottom, rgba(232,153,26,0.25) 0px, rgba(232,153,26,0.25) 6px, transparent 6px, transparent 12px)", alignSelf: "stretch" }} />

      {/* Seite 3 */}
      <div className="panel-right" style={{ ...panelStyle, background: "#0a0704", display: "flex", flexDirection: "column", justifyContent: "center", padding: "8% 7%", gap: "1em" }}>
        <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: 0, opacity: 0.8 }}>
          So bist du dabei
        </p>
        <h2 className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(0.9rem, 2.4vw, 1.7rem)", color: A, lineHeight: 1.15, margin: 0 }}>
          Dabei sein ist alles.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {[
            ["1", "Interesse anmelden", "Einfach QR-Code scannen und auf der Website eintragen — kein Aufwand."],
            ["2", "Einladung & Details erhalten", "Du bekommst alle weiteren Infos direkt per Mail zugeschickt."],
            ["3", "Anmeldegebühr überweisen", "Sobald alles feststeht, wird die Gebühr fällig — dann gibt's dein Ticket."],
            ["4", "Einfach kommen", "Ticket vorzeigen, reinkommen, genießen."],
          ].map(([n, title, text]) => (
            <div key={n} style={{ display: "flex", gap: "0.75em", alignItems: "flex-start" }}>
              <div className="p-step-num" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(0.8rem, 2vw, 1.4rem)", color: A, lineHeight: 1, flexShrink: 0, minWidth: "1.2em" }}>{n}</div>
              <div>
                <div className="p-step-title" style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "clamp(0.48rem, 1.05vw, 0.78rem)", color: FG, lineHeight: 1.3 }}>{title}</div>
                <div className="p-step-text" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.44rem, 0.95vw, 0.7rem)", color: FG, opacity: 0.65, lineHeight: 1.5, marginTop: "0.15em" }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-qr-box" style={{ display: "flex", alignItems: "center", gap: "1em", marginTop: "0.5em", padding: "0.8em", background: "rgba(232,153,26,0.08)", borderRadius: "6px", border: "1px solid rgba(232,153,26,0.25)" }}>
          <div style={{ background: "#fff", padding: "clamp(3px, 0.6%, 7px)", borderRadius: "4px", lineHeight: 0, flexShrink: 0 }}>
            <QRCodeSVG value={SITE_URL} size={256} bgColor="#fff" fgColor="#0a0704" level="H"
              style={{ width: "clamp(38px, 8.5vw, 68px)", height: "auto", display: "block" }} />
          </div>
          <div>
            <div className="p-qr-label" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(0.55rem, 1.3vw, 0.95rem)", color: A, fontWeight: 700 }}>Jetzt anmelden</div>
            <div className="p-qr-url" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 0.9vw, 0.68rem)", color: FG, opacity: 0.65, marginTop: "0.2em" }}>emmerich-boomt.replit.app</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const spreadStyle: React.CSSProperties = {
  width: "min(297mm, 96vw)",
  aspectRatio: "297 / 210",
  display: "flex",
  flexDirection: "row",
  boxShadow: "0 16px 60px rgba(0,0,0,0.7)",
  flexShrink: 0,
};

const panelStyle: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  position: "relative",
  boxSizing: "border-box",
};
