import { QRCodeSVG } from "qrcode.react";

const SITE_URL = "https://emmerich-boomt.replit.app";
const WA_URL   = "https://chat.whatsapp.com/Ie7Jo01K44H8BREFq4XuIV?mode=gi_t";

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

      {/* Außenseite: Seite 4 (links) + Seite 1 (rechts) */}
      <div className="no-print" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,232,200,0.35)", alignSelf: "flex-start", marginLeft: "2vw" }}>
        Druckseite 1 — Außenseite (Seite 4 links · Seite 1 rechts)
      </div>
      <Aussen />

      {/* Innenseite: Seite 2 (links) + Seite 3 (rechts) */}
      <div className="no-print" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,232,200,0.35)", alignSelf: "flex-start", marginLeft: "2vw" }}>
        Druckseite 2 — Innenseite (Seite 2 links · Seite 3 rechts)
      </div>
      <Innen />

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body, html { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .no-print { display: none !important; }
          .flyer-page {
            background: #fff !important;
            padding: 0 !important;
            gap: 0 !important;
            min-height: 0 !important;
            display: block !important;
            width: 297mm !important;
          }
          .flyer-spread {
            box-shadow: none !important;
            width: 297mm !important;
            height: 210mm !important;
            min-height: 0 !important;
            max-height: 210mm !important;
            aspect-ratio: auto !important;
            overflow: hidden !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: row !important;
          }
          .panel-sender, .panel-left, .panel-right, .panel-cover {
            width: 148.5mm !important;
            min-width: 148.5mm !important;
            max-width: 148.5mm !important;
            height: 210mm !important;
            flex: none !important;
            overflow: hidden !important;
          }
          .panel-sender { background: #fff !important; }
          .panel-sender .p-label   { color: ${A2} !important; opacity: 1 !important; }
          .panel-sender .p-heading  { color: ${A2} !important; }
          .panel-sender .p-body    { color: #1a0e04 !important; opacity: 1 !important; }
          .panel-sender .p-wa-text { color: #075e54 !important; opacity: 1 !important; }
          .panel-sender .p-url     { color: ${A2} !important; opacity: 1 !important; }
          .panel-left { background: #fff !important; border-right: 1px dashed #ccc; }
          .panel-left .p-label    { color: ${A2} !important; opacity: 1 !important; }
          .panel-left .p-heading   { color: ${A2} !important; }
          .panel-left .p-body     { color: #1a0e04 !important; opacity: 1 !important; }
          .panel-left .p-note     { color: #1a0e04 !important; background: #f7f0e0 !important; border-color: #e0c88a !important; opacity: 1 !important; }
          .panel-right { background: #fff !important; }
          .panel-right .p-label      { color: ${A2} !important; opacity: 1 !important; }
          .panel-right .p-heading     { color: ${A2} !important; }
          .panel-right .p-step-num   { color: ${A2} !important; }
          .panel-right .p-step-title { color: #1a0e04 !important; }
          .panel-right .p-step-text  { color: #3a2a0a !important; opacity: 1 !important; }
          .panel-right .p-qr-box     { background: #f7f0e0 !important; border: 1px solid #e0c88a !important; }
          .panel-right .p-qr-label   { color: ${A2} !important; }
          .panel-right .p-qr-url     { color: #3a2a0a !important; opacity: 1 !important; }
          .faltlinie { background: repeating-linear-gradient(to bottom, #bbb 0px, #bbb 4px, transparent 4px, transparent 8px) !important; width: 1px !important; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   AUSSENSEITE
   links  = Seite 4 — BoomerClub (Rückseite / Absender)
   rechts = Seite 1 — Deckblatt mit Foto
   ════════════════════════════════════════════════════ */
function Aussen() {
  return (
    <div className="flyer-spread" style={spreadStyle}>

      {/* ── Seite 4: BoomerClub-Hinweis ── */}
      <div className="panel-sender" style={{ ...panelStyle, background: BG, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "7% 7%" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 1vw, 0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: 0, opacity: 0.8 }}>
            Der BoomerClub Emmerich
          </p>
          <div className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(0.9rem, 2.6vw, 1.85rem)", color: A, lineHeight: 1.1 }}>
            Gegründet 2024 — an der Theke der Societät.
          </div>
        </div>

        <div className="p-body" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.5rem, 1.15vw, 0.85rem)", color: FG, lineHeight: 1.75, opacity: 0.88 }}>
          <p style={{ margin: "0 0 0.7em" }}>
            Rund <strong style={{ color: A }}>130 Leute</strong> aus Emmerich und Umgebung sind dabei.
            Manche kommen zu den gemütlichen Treffen — die finden alle vier bis sechs Monate statt, etwa dreimal im Jahr.
          </p>
          <p style={{ margin: 0 }}>
            Andere verfolgen einfach, was so passiert — direkt über WhatsApp. Beides ist vollkommen richtig. Passt doch.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
          {/* Website QR */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
            <div style={{ background: "#fff", padding: "clamp(2px, 0.5%, 6px)", borderRadius: "4px", lineHeight: 0, flexShrink: 0 }}>
              <QRCodeSVG value={SITE_URL} size={256} bgColor="#fff" fgColor={BG} level="M"
                style={{ width: "clamp(30px, 6.5vw, 54px)", height: "auto", display: "block" }} />
            </div>
            <p className="p-url" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", color: A, margin: 0, lineHeight: 1.4, opacity: 0.9 }}>
              emmerich-boomt.replit.app<br />
              <span style={{ opacity: 0.7, fontSize: "0.9em" }}>Zur Party-Website</span>
            </p>
          </div>
          {/* WhatsApp QR */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
            <div style={{ background: "#fff", padding: "clamp(2px, 0.5%, 6px)", borderRadius: "4px", lineHeight: 0, flexShrink: 0 }}>
              <QRCodeSVG value={WA_URL} size={256} bgColor="#fff" fgColor="#075e54" level="M"
                style={{ width: "clamp(30px, 6.5vw, 54px)", height: "auto", display: "block" }} />
            </div>
            <p className="p-wa-text" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", color: "#4fce82", margin: 0, lineHeight: 1.4, opacity: 0.9 }}>
              WhatsApp-Gruppe<br />
              <span style={{ opacity: 0.8, fontSize: "0.9em" }}>BoomerClub Emmerich</span>
            </p>
          </div>
        </div>
      </div>

      <div className="faltlinie" style={{ width: "1px", flexShrink: 0, background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 6px, transparent 6px, transparent 12px)", alignSelf: "stretch" }} />

      {/* ── Seite 1: Deckblatt ── */}
      <div className="panel-cover" style={{ ...panelStyle, background: "#E8891A", position: "relative", overflow: "hidden" }}>
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

/* ════════════════════════════════════════════════════
   INNENSEITE
   links  = Seite 2 — Was euch erwartet (Geschichte / Brief)
   rechts = Seite 3 — Wie ihr dabei seid (Prozess)
   ════════════════════════════════════════════════════ */
function Innen() {
  return (
    <div className="flyer-spread" style={spreadStyle}>

      {/* ── Seite 2: Geschichte & Was erwartet euch ── */}
      <div className="panel-left" style={{ ...panelStyle, background: "#1a0e04", display: "flex", flexDirection: "column", justifyContent: "center", padding: "7% 7%", gap: "1em" }}>
        <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: 0, opacity: 0.8 }}>
          Emmerich, Frühjahr 2026
        </p>
        <h2 className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(0.95rem, 2.6vw, 1.85rem)", color: A, lineHeight: 1.1, margin: 0 }}>
          Am 18. Juli 2026 gibt es eine Party. Auf dem Bölt. Und die wird gut.
        </h2>
        <div className="p-body" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.5rem, 1.1vw, 0.82rem)", color: FG, lineHeight: 1.75, opacity: 0.88 }}>
          <ul style={{ listStyle: "none", margin: "0 0 0.8em", padding: 0, display: "flex", flexDirection: "column", gap: "0.4em" }}>
            {[
              "Abrocken — zu Musik, bei der man den Text noch kann",
              "70er, 80er und Aktuelles — laut, tanzbar, zum Mitsingen",
              "Alte Freunde treffen — manche vielleicht nach Jahren",
              "Gespräche an der Theke — die irgendwie immer die besten sind",
              "Nostalgie — aber die gute Art, bei der einem warm ums Herz wird",
              "Fingerfood, Getränke — kein Dresscode, ganz zwanglos",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: "0.45em" }}>
                <span style={{ color: A, flexShrink: 0 }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-note" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.44rem, 0.95vw, 0.72rem)", color: FG, opacity: 0.65, lineHeight: 1.6, padding: "0.6em 0.8em", background: "rgba(232,153,26,0.07)", borderLeft: `2px solid rgba(232,153,26,0.3)`, borderRadius: "0 3px 3px 0" }}>
          Das wird eine geschlossene Gesellschaft — kein offenes Stadtfest. Wer sich angesprochen fühlt, ist dabei. Und wer jemanden kennt: <strong style={{ color: A }}>gerne weitersagen.</strong>
        </div>
      </div>

      <div className="faltlinie" style={{ width: "1px", flexShrink: 0, background: "repeating-linear-gradient(to bottom, rgba(232,153,26,0.25) 0px, rgba(232,153,26,0.25) 6px, transparent 6px, transparent 12px)", alignSelf: "stretch" }} />

      {/* ── Seite 3: Prozess — So seid ihr dabei ── */}
      <div className="panel-right" style={{ ...panelStyle, background: "#0a0704", display: "flex", flexDirection: "column", justifyContent: "center", padding: "7% 7%", gap: "1.1em" }}>
        <p className="p-label" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.42rem, 0.95vw, 0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: A, margin: 0, opacity: 0.8 }}>
          So seid ihr dabei
        </p>
        <h2 className="p-heading" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(0.9rem, 2.4vw, 1.7rem)", color: A, lineHeight: 1.1, margin: 0 }}>
          Dabei sein ist alles.
        </h2>

        {/* 2-Schritt-Prozess */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {([
            [
              "1",
              "Jetzt: Interesse anmelden",
              "Einfach QR-Code scannen oder auf der Website melden — kein Aufwand, keine Kosten. Bis Ende April.",
              "Schritt 1 von 2"
            ],
            [
              "2",
              "Im Mai: Verbindlich anmelden",
              "Dann kommt die konkrete Planung — und die richtige Anmeldung mit 10 EUR für Musik und Fingerfood. Dann gibt's auch das Ticket.",
              "Schritt 2 von 2"
            ],
          ] as [string, string, string, string][]).map(([n, title, text]) => (
            <div key={n} style={{ display: "flex", gap: "0.9em", alignItems: "flex-start", padding: "0.8em", background: "rgba(232,153,26,0.06)", borderRadius: "4px", border: "1px solid rgba(232,153,26,0.15)" }}>
              <div className="p-step-num" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 2.2rem)", color: A, lineHeight: 1, flexShrink: 0, minWidth: "1.1em", textAlign: "center" }}>{n}</div>
              <div>
                <div className="p-step-title" style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(0.52rem, 1.1vw, 0.82rem)", color: FG, lineHeight: 1.3, marginBottom: "0.3em" }}>{title}</div>
                <div className="p-step-text" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "clamp(0.46rem, 1vw, 0.74rem)", color: FG, opacity: 0.65, lineHeight: 1.55 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* QR-Code Box */}
        <div className="p-qr-box" style={{ display: "flex", alignItems: "center", gap: "1em", padding: "0.9em", background: "rgba(232,153,26,0.1)", borderRadius: "6px", border: "1px solid rgba(232,153,26,0.3)" }}>
          <div style={{ background: "#fff", padding: "clamp(3px, 0.6%, 8px)", borderRadius: "4px", lineHeight: 0, flexShrink: 0 }}>
            <QRCodeSVG value={SITE_URL} size={256} bgColor="#fff" fgColor="#0a0704" level="H"
              style={{ width: "clamp(40px, 9vw, 72px)", height: "auto", display: "block" }} />
          </div>
          <div>
            <div className="p-qr-label" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(0.6rem, 1.4vw, 1rem)", color: A, fontWeight: 700 }}>
              Jetzt Interesse anmelden
            </div>
            <div className="p-qr-url" style={{ fontFamily: "'Lora', serif", fontSize: "clamp(0.44rem, 0.95vw, 0.72rem)", color: FG, opacity: 0.6, marginTop: "0.25em" }}>
              emmerich-boomt.replit.app
            </div>
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
