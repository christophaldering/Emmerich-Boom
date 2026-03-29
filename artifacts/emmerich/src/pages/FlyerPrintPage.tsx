import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const SITE_URL = "https://emmerich-boomt.replit.app";
const WA_URL   = "https://chat.whatsapp.com/Ie7Jo01K44H8BREFq4XuIV?mode=gi_t";
const A        = "#E8991A";
const A2       = "#c97d10";
const BG       = "#0a0704";
const FG       = "#f5e8c8";

/* ─────────────────────────────────────────────────────────────────
   Print-CSS in <head> injiziert (nicht im body!).
   100vh = tatsächliche Seitenhöhe wie iOS sie setzt — verhindert
   Überlauf auf Ghostseiten.
───────────────────────────────────────────────────────────────── */
const PRINT_CSS = `
  @media print {
    @page { size: A4 landscape; margin: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    html, body { margin: 0 !important; padding: 0 !important; width: 100vw !important; height: auto !important; background: #fff !important; overflow: visible !important; }
    #root { margin: 0 !important; padding: 0 !important; display: block !important; overflow: visible !important; height: auto !important; }
    .fp-screen { display: none !important; }
    .pdf-spreads { display: none !important; }
    .fp-spread {
      width: 100vw !important; height: 100vh !important;
      max-height: 100vh !important; min-height: 0 !important;
      overflow: hidden !important; display: flex !important;
      flex-direction: row !important;
      page-break-inside: avoid !important; break-inside: avoid !important;
      box-shadow: none !important;
    }
    .fp-spread-outer { page-break-after: always !important; break-after: page !important; }
    .fp-spread-inner { page-break-after: auto !important; break-after: auto !important; }
    .fp-panel { width: 50vw !important; min-width: 50vw !important; max-width: 50vw !important; height: 100vh !important; flex: none !important; overflow: hidden !important; }
    .fp-dark { background: #fff !important; }
    .fp-dark * { color: #1a0e04 !important; opacity: 1 !important; }
    .fp-dark .fp-amber { color: ${A2} !important; }
    .fp-dark .fp-wa    { color: #075e54 !important; }
    .fp-dark .fp-note  { background: #f7f0e0 !important; border-color: #e0c88a !important; color: #1a0e04 !important; }
    .fp-dark .fp-step  { background: #f5ede0 !important; border-color: #e0c88a !important; }
    .fp-dark .fp-step-num { color: ${A2} !important; font-size: clamp(1.2rem, 3vw, 2.2rem); }
    .fp-dark .fp-qrbox { background: #f7f0e0 !important; border-color: ${A2} !important; }
    .fp-line { background: #ccc !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────────
   Feste Pixel-Dimensionen für html2canvas-Capture (297mm × 210mm
   bei ~72 DPI, dann scale=4 → ~288 DPI in der PDF).
───────────────────────────────────────────────────────────────── */
const CW = 841; // canvas width  px
const CH = 595; // canvas height px
const PW = CW / 2; // panel width  px

/* ═══════════════════════════════════════════════════════════════════
   HAUPTKOMPONENTE
═══════════════════════════════════════════════════════════════════ */
export default function FlyerPrintPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "generating">("loading");
  const pdfSpreadRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Inject print CSS into <head> */
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "fp-print-css";
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);

    const t = setTimeout(() => setStatus("ready"), 1400);
    return () => { clearTimeout(t); document.getElementById("fp-print-css")?.remove(); };
  }, []);

  /* Auto-print when ready */
  useEffect(() => {
    if (status === "ready") window.print();
  }, [status]);

  /* ── PDF-Download via html2canvas + jsPDF ── */
  async function handleDownloadPDF() {
    setStatus("generating");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < 2; i++) {
        const el = pdfSpreadRefs.current[i];
        if (!el) continue;
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(el, {
          scale: 4,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: "#ffffff",
          width: CW,
          height: CH,
          windowWidth: CW,
          windowHeight: CH,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      }

      pdf.save("Emmerich-Boomt-Flyer.pdf");
    } finally {
      setStatus("ready");
    }
  }

  return (
    <>
      {/* ── Screen-Overlay (in Print ausgeblendet) ── */}
      <div className="fp-screen" style={{
        position: "fixed", inset: 0, background: BG, zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.4rem", color: A, textAlign: "center" }}>
          {status === "loading"    && "Druckvorschau wird vorbereitet…"}
          {status === "ready"      && "Druckdialog geöffnet"}
          {status === "generating" && "PDF wird erstellt…"}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(245,232,200,0.5)", textAlign: "center", lineHeight: 1.8, maxWidth: "22rem" }}>
          Im Druckdialog: Papierformat A4 · Querformat · Ränder „Keine" · Beidseitig · In der Mitte falten
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => window.print()} disabled={status === "generating"} style={{
            background: A, border: "none", borderRadius: "4px", color: BG,
            padding: "0.65rem 1.8rem", fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            opacity: status === "generating" ? 0.5 : 1,
          }}>
            Nochmals drucken
          </button>
          <button onClick={handleDownloadPDF} disabled={status === "generating"} style={{
            background: "transparent", border: `2px solid ${A}`, borderRadius: "4px", color: A,
            padding: "0.65rem 1.8rem", fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            opacity: status === "generating" ? 0.5 : 1,
          }}>
            {status === "generating" ? "Erstelle PDF…" : "⬇ Als PDF speichern"}
          </button>
          <a href="/flyer" style={{
            background: "transparent", border: `1px solid rgba(245,232,200,0.25)`, borderRadius: "4px", color: "rgba(245,232,200,0.5)",
            padding: "0.65rem 1.5rem", fontFamily: "'Lora', serif",
            fontStyle: "italic", fontSize: "0.9rem", cursor: "pointer", textDecoration: "none",
          }}>
            ← Zurück
          </a>
        </div>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.72rem", color: "rgba(245,232,200,0.3)", margin: 0, textAlign: "center" }}>
          „Als PDF speichern" → PDF öffnen → Drucken garantiert 2 Seiten
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          DRUCKSEITEN (dunkler Hintergrund auf Screen → weiß in Print)
          ════════════════════════════════════════════════════════════ */}
      <SpreadOuter className="fp-spread fp-spread-outer" style={screenSpreadStyle} />
      <SpreadInner className="fp-spread fp-spread-inner" style={screenSpreadStyle} />

      {/* ════════════════════════════════════════════════════════════
          PDF-CAPTURE: off-screen, weiße Hintergründe, Fixgröße
          ════════════════════════════════════════════════════════════ */}
      <div className="pdf-spreads" style={{ position: "fixed", top: -9999, left: -9999, pointerEvents: "none", zIndex: -1 }}>
        <div ref={el => { pdfSpreadRefs.current[0] = el; }}>
          <SpreadOuter pdf style={{ width: CW, height: CH, display: "flex", flexDirection: "row", overflow: "hidden" }} />
        </div>
        <div ref={el => { pdfSpreadRefs.current[1] = el; }}>
          <SpreadInner pdf style={{ width: CW, height: CH, display: "flex", flexDirection: "row", overflow: "hidden" }} />
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SPREAD 1 — AUSSENSEITE
   links  = Seite 4: BoomerClub
   rechts = Seite 1: Deckblatt / Foto
════════════════════════════════════════════════════════════════════ */
function SpreadOuter({ className, style, pdf }: { className?: string; style?: React.CSSProperties; pdf?: boolean }) {
  const dark  = !pdf;
  const bg0   = dark ? BG       : "#ffffff";
  const bg4   = dark ? BG       : "#ffffff";  // BoomerClub panel
  const head  = dark ? A        : A2;
  const body  = dark ? FG       : "#1a0e04";
  const muted = dark ? "rgba(245,232,200,0.65)" : "#3a2810";
  const lbl   = dark ? A        : A2;
  const wa    = dark ? "#4fce82": "#075e54";
  const noteB = dark ? "rgba(232,153,26,0.07)" : "#f7f0e0";
  const noteC = dark ? "rgba(232,153,26,0.3)"  : "#e0c88a";

  const PH = pdf ? CH : undefined;
  const pw = pdf ? PW : undefined;

  return (
    <div className={className} style={style}>
      {/* Seite 4 — BoomerClub */}
      <div className="fp-panel fp-dark" style={{
        background: bg4, flex: pw ? "none" : 1,
        width: pw, minWidth: pw, maxWidth: pw, height: PH,
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "7%", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          <p className="fp-amber" style={{ fontFamily: "'Lora', serif", fontSize: pdf ? 10 : "clamp(0.42rem,1vw,0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: lbl, margin: 0 }}>
            Der BoomerClub Emmerich
          </p>
          <div className="fp-amber" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: pdf ? 26 : "clamp(0.9rem,2.6vw,1.85rem)", color: head, lineHeight: 1.1 }}>
            Gegründet 2024 — an der Theke der Societät.
          </div>
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: pdf ? 11 : "clamp(0.5rem,1.15vw,0.85rem)", color: body, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 0.7em" }}>
            Rund <strong style={{ color: head }}>130 Leute</strong> aus Emmerich und Umgebung sind dabei. Manche kommen zu den gemütlichen Treffen — alle vier bis sechs Monate, etwa dreimal im Jahr.
          </p>
          <p style={{ margin: 0 }}>
            Andere verfolgen einfach, was so passiert — direkt über WhatsApp. Beides ist vollkommen richtig. Passt doch.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
            <div style={{ background: "#fff", padding: pdf ? 4 : "clamp(2px,0.5%,6px)", borderRadius: 4, lineHeight: 0, flexShrink: 0, border: "1px solid #eee" }}>
              <QRCodeSVG value={SITE_URL} size={pdf ? 52 : 256} bgColor="#fff" fgColor={BG} level="M"
                style={{ width: pdf ? 52 : "clamp(30px,6.5vw,54px)", height: "auto", display: "block" }} />
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 9 : "clamp(0.42rem,0.95vw,0.72rem)", color: lbl, margin: 0, lineHeight: 1.4 }}>
              emmerich-boomt.replit.app<br /><span style={{ opacity: 0.7, fontSize: "0.9em", color: muted }}>Zur Party-Website</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
            <div style={{ background: "#fff", padding: pdf ? 4 : "clamp(2px,0.5%,6px)", borderRadius: 4, lineHeight: 0, flexShrink: 0, border: "1px solid #eee" }}>
              <QRCodeSVG value={WA_URL} size={pdf ? 52 : 256} bgColor="#fff" fgColor="#075e54" level="M"
                style={{ width: pdf ? 52 : "clamp(30px,6.5vw,54px)", height: "auto", display: "block" }} />
            </div>
            <p className="fp-wa" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 9 : "clamp(0.42rem,0.95vw,0.72rem)", color: wa, margin: 0, lineHeight: 1.4 }}>
              WhatsApp-Gruppe<br /><span style={{ opacity: 0.8, fontSize: "0.9em" }}>BoomerClub Emmerich</span>
            </p>
          </div>
        </div>
      </div>

      <div className="fp-line" style={{ width: 1, flexShrink: 0, background: dark ? "rgba(232,153,26,0.25)" : "#ddd", alignSelf: "stretch" }} />

      {/* Seite 1 — Deckblatt */}
      <div className="fp-panel" style={{
        background: "#E8891A", flex: pw ? "none" : 1,
        width: pw, minWidth: pw, maxWidth: pw, height: PH,
        position: "relative", overflow: "hidden", boxSizing: "border-box",
      }}>
        <svg viewBox="0 0 1000 1000" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.22, zIndex: 0, pointerEvents: "none" }} preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * 360, r = (a * Math.PI) / 180;
            const aN = ((i + 0.5) / 20) * 360, rN = (aN * Math.PI) / 180;
            return <polygon key={i} points={`500,500 ${500+Math.cos(r)*1500},${500+Math.sin(r)*1500} ${500+Math.cos(rN)*1500},${500+Math.sin(rN)*1500}`} fill={i%2===0?"#fff":"#c97d10"} />;
          })}
        </svg>
        <img src="/boomerparty-foto.jpeg" alt="BoomerParty"
          crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, background: "linear-gradient(to bottom,rgba(232,137,26,0.95) 55%,rgba(232,137,26,0))", padding: "5% 5% 12%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: pdf ? 42 : "clamp(1.2rem,5.5vw,4rem)", lineHeight: 0.88, color: "#fff", textTransform: "uppercase", textShadow: "3px 4px 0 rgba(0,0,0,0.2)" }}>
            EMMERICH<br />BOOMT!
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 11 : "clamp(0.5rem,1.6vw,1.1rem)", color: "#0a0704", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "3%", opacity: 0.85 }}>
            Die BoomerParty
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, background: "linear-gradient(to top,rgba(160,85,5,0.95) 55%,rgba(160,85,5,0))", padding: "10% 5% 5%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: pdf ? 20 : "clamp(0.7rem,2.2vw,1.55rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.2 }}>
            Samstag, 18. Juli 2026
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 11 : "clamp(0.5rem,1.4vw,0.95rem)", color: "#fff", opacity: 0.9, marginTop: "2%" }}>
            Bölt / Kapaunenberg · Emmerich am Rhein
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SPREAD 2 — INNENSEITE
   links  = Seite 2: Geschichte / Party-Info
   rechts = Seite 3: Prozess / Anmeldung
════════════════════════════════════════════════════════════════════ */
function SpreadInner({ className, style, pdf }: { className?: string; style?: React.CSSProperties; pdf?: boolean }) {
  const dark   = !pdf;
  const bg2    = dark ? "#1a0e04" : "#ffffff";
  const bg3    = dark ? BG        : "#ffffff";
  const head   = dark ? A         : A2;
  const body   = dark ? FG        : "#1a0e04";
  const muted  = dark ? "rgba(245,232,200,0.65)" : "#3a2810";
  const lbl    = dark ? A         : A2;
  const noteB  = dark ? "rgba(232,153,26,0.07)" : "#f7f0e0";
  const noteC  = dark ? "rgba(232,153,26,0.3)"  : "#e0c88a";
  const stepB  = dark ? "rgba(232,153,26,0.06)" : "#f5ede0";
  const stepC  = dark ? "rgba(232,153,26,0.15)" : "#e0c88a";
  const qrB    = dark ? "rgba(232,153,26,0.1)"  : "#f7f0e0";
  const qrC    = dark ? "rgba(232,153,26,0.3)"  : A2;

  const PH = pdf ? CH : undefined;
  const pw = pdf ? PW : undefined;

  return (
    <div className={className} style={style}>
      {/* Seite 2 — Geschichte */}
      <div className="fp-panel fp-dark" style={{
        background: bg2, flex: pw ? "none" : 1,
        width: pw, minWidth: pw, maxWidth: pw, height: PH,
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "7%", gap: "1em", boxSizing: "border-box",
      }}>
        <p className="fp-amber" style={{ fontFamily: "'Lora', serif", fontSize: pdf ? 9 : "clamp(0.42rem,0.95vw,0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: lbl, margin: 0 }}>
          Emmerich, Frühjahr 2026
        </p>
        <h2 className="fp-amber" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: pdf ? 22 : "clamp(0.95rem,2.6vw,1.85rem)", color: head, lineHeight: 1.1, margin: 0 }}>
          Am 18. Juli 2026 gibt es eine Party. Auf dem Bölt. Und die wird gut.
        </h2>
        <ul style={{ listStyle: "none", margin: "0 0 0.3em", padding: 0, display: "flex", flexDirection: "column", gap: pdf ? "0.25em" : "0.35em" }}>
          {[
            "Abrocken — zu Musik, bei der man den Text noch kann",
            "70er, 80er und Aktuelles — laut, tanzbar, zum Mitsingen",
            "Alte Freunde treffen — manche vielleicht nach Jahren",
            "Gespräche an der Theke — die irgendwie immer die besten sind",
            "Nostalgie — aber die gute Art, bei der einem warm ums Herz wird",
            "Fingerfood, Getränke — kein Dresscode, ganz zwanglos",
          ].map((item, i) => (
            <li key={i} style={{ display: "flex", gap: "0.45em", fontFamily: "'Lora', serif", fontSize: pdf ? 10 : "clamp(0.5rem,1.1vw,0.82rem)", color: body, lineHeight: 1.6 }}>
              <span className="fp-amber" style={{ color: head, flexShrink: 0 }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="fp-note" style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 9 : "clamp(0.44rem,0.95vw,0.72rem)", color: muted, lineHeight: 1.6, padding: "0.6em 0.8em", background: noteB, borderLeft: `2px solid ${noteC}`, borderRadius: "0 3px 3px 0" }}>
          Das wird eine geschlossene Gesellschaft — kein offenes Stadtfest. Wer sich angesprochen fühlt, ist dabei. Und wer jemanden kennt: <strong style={{ color: head }}>gerne weitersagen.</strong>
        </div>
      </div>

      <div className="fp-line" style={{ width: 1, flexShrink: 0, background: dark ? "rgba(232,153,26,0.2)" : "#ddd", alignSelf: "stretch" }} />

      {/* Seite 3 — Prozess */}
      <div className="fp-panel fp-dark" style={{
        background: bg3, flex: pw ? "none" : 1,
        width: pw, minWidth: pw, maxWidth: pw, height: PH,
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "7%", gap: "1em", boxSizing: "border-box",
      }}>
        <p className="fp-amber" style={{ fontFamily: "'Lora', serif", fontSize: pdf ? 9 : "clamp(0.42rem,0.95vw,0.72rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: lbl, margin: 0 }}>
          So seid ihr dabei
        </p>
        <h2 className="fp-amber" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: pdf ? 22 : "clamp(0.9rem,2.4vw,1.7rem)", color: head, lineHeight: 1.1, margin: 0 }}>
          Dabei sein ist alles.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: pdf ? "0.6em" : "0.9em" }}>
          {([
            ["1", "Jetzt: Interesse anmelden", "Einfach QR-Code scannen oder auf der Website melden — kein Aufwand, keine Kosten. Bis Ende April."],
            ["2", "Im Mai: Verbindlich anmelden", "Dann kommt die konkrete Planung — und die richtige Anmeldung mit 10 EUR für Musik und Fingerfood. Dann gibt's auch das Ticket."],
          ] as [string, string, string][]).map(([n, title, text]) => (
            <div key={n} className="fp-step" style={{ display: "flex", gap: "0.8em", alignItems: "flex-start", padding: pdf ? "0.5em 0.7em" : "0.75em", background: stepB, borderRadius: 4, border: `1px solid ${stepC}` }}>
              <div className="fp-step-num fp-amber" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: pdf ? 28 : "clamp(1.2rem,3vw,2.2rem)", color: head, lineHeight: 1, flexShrink: 0, minWidth: "1.1em", textAlign: "center" }}>{n}</div>
              <div>
                <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: pdf ? 10.5 : "clamp(0.52rem,1.1vw,0.82rem)", color: body, lineHeight: 1.3, marginBottom: "0.25em" }}>{title}</div>
                <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: pdf ? 9.5 : "clamp(0.46rem,1vw,0.74rem)", color: muted, lineHeight: 1.5 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="fp-qrbox" style={{ display: "flex", alignItems: "center", gap: "0.9em", padding: pdf ? "0.6em 0.8em" : "0.85em", background: qrB, borderRadius: 6, border: `1px solid ${qrC}` }}>
          <div style={{ background: "#fff", padding: pdf ? 4 : "clamp(3px,0.6%,8px)", borderRadius: 4, lineHeight: 0, flexShrink: 0, border: "1px solid #eee" }}>
            <QRCodeSVG value={SITE_URL} size={pdf ? 60 : 256} bgColor="#fff" fgColor="#0a0704" level="H"
              style={{ width: pdf ? 60 : "clamp(40px,9vw,72px)", height: "auto", display: "block" }} />
          </div>
          <div>
            <div className="fp-amber" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: pdf ? 13 : "clamp(0.6rem,1.4vw,1rem)", color: head, fontWeight: 700 }}>
              Jetzt Interesse anmelden
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: pdf ? 9 : "clamp(0.44rem,0.95vw,0.72rem)", color: muted, marginTop: "0.2em" }}>
              emmerich-boomt.replit.app
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Screen-only styles ── */
const screenSpreadStyle: React.CSSProperties = {
  width: "min(297mm, 96vw)",
  aspectRatio: "297 / 210",
  display: "flex",
  flexDirection: "row",
  flexShrink: 0,
};
