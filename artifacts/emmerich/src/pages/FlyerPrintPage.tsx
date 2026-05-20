import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SITE_URL = "https://www.emmerich-boomt.de";
const WA_URL   = "https://chat.whatsapp.com/Ie7Jo01K44H8BREFq4XuIV?mode=gi_t";
const A        = "#E8991A";
const A2       = "#c97d10";
const BG       = "#0a0704";
const FG       = "#f5e8c8";

/* feste Pixel-Größen der PDF-Captures:
   841×595 px ≈ A4 landscape bei 72 dpi → mit scale 4 = 288 dpi */
const CW = 841;
const CH = 595;
const PW = CW / 2;

export default function FlyerPrintPage() {
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  /* Fonts sicherstellen, dann Status setzen */
  useEffect(() => {
    document.fonts.ready.then(() => setState("idle"));
  }, []);

  async function handleGenerate() {
    setState("generating");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < 2; i++) {
        const el = refs.current[i];
        if (!el) continue;
        if (i > 0) pdf.addPage();

        /* Sicherstellen, dass Bilder geladen */
        const imgs = el.querySelectorAll<HTMLImageElement>("img");
        await Promise.all(Array.from(imgs).map(img =>
          img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })
        ));

        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: false,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: CW,
          height: CH,
          windowWidth: CW,
          windowHeight: CH,
          imageTimeout: 8000,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.93);
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      }

      /* Blob URL erstellen — iOS öffnet PDF direkt im Browser */
      const blob = pdf.output("blob");
      const url  = URL.createObjectURL(blob);
      setPdfUrl(url);
      setState("done");

      /* PDF öffnen */
      const a = document.createElement("a");
      a.href = url;
      a.download = "Emmerich-Boomt-Flyer.pdf";
      a.click();

    } catch (e) {
      console.error(e);
      setState("idle");
    }
  }

  return (
    <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", gap: "2rem" }}>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(245,232,200,0.45)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 0.6rem" }}>
          Emmerich Boomt · Flyer
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 4vw, 2rem)", color: A, margin: 0, lineHeight: 1.1 }}>
          Flyer als PDF speichern
        </h1>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(245,232,200,0.5)", margin: "0.6rem 0 0", lineHeight: 1.7 }}>
          A4 · Querformat · 2 Seiten · In der Mitte falten
        </p>
      </div>

      {/* Haupt-Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {state !== "done" ? (
          <button
            onClick={handleGenerate}
            disabled={state === "generating"}
            style={{
              background: state === "generating" ? "rgba(232,153,26,0.4)" : A,
              border: "none", borderRadius: "6px", color: BG,
              padding: "1rem 3rem", fontSize: "1.15rem",
              fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700,
              cursor: state === "generating" ? "default" : "pointer",
              boxShadow: state === "generating" ? "none" : `0 4px 20px rgba(232,153,26,0.35)`,
              transition: "all 0.2s",
            }}
          >
            {state === "generating" ? "PDF wird erstellt …" : "⬇ PDF herunterladen"}
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: "#4fce82", fontWeight: 700 }}>
              ✓ PDF wurde heruntergeladen
            </div>
            {pdfUrl && (
              <a href={pdfUrl} download="Emmerich-Boomt-Flyer.pdf" target="_blank" rel="noreferrer" style={{
                color: A, fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem",
                textDecoration: "underline", cursor: "pointer",
              }}>
                Erneut öffnen / herunterladen
              </a>
            )}
            <button onClick={() => { setState("idle"); setPdfUrl(null); }} style={{
              background: "transparent", border: `1px solid rgba(232,153,26,0.4)`, borderRadius: "4px",
              color: "rgba(245,232,200,0.5)", padding: "0.4rem 1.2rem",
              fontFamily: "'Lora', serif", fontSize: "0.8rem", cursor: "pointer",
            }}>
              Neues PDF erstellen
            </button>
          </div>
        )}

        {/* Schritt-für-Schritt-Anleitung */}
        <div style={{
          background: "rgba(232,153,26,0.06)", border: `1px solid rgba(232,153,26,0.2)`,
          borderRadius: "8px", padding: "1.2rem 1.5rem", maxWidth: "24rem", textAlign: "left",
          fontFamily: "'Lora', serif",
        }}>
          <p style={{ fontWeight: 700, fontSize: "0.8rem", color: A, margin: "0 0 0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Drucken in 4 Schritten
          </p>
          {[
            ["1", "PDF herunterladen (oben)"],
            ["2", "PDF öffnen → Teilen → Drucken"],
            ["3", "Papierformat: A4 · Ausrichtung: Querformat · Doppelseitig: Ein"],
            ["4", "Drucken → Papier in der Mitte falten"],
          ].map(([n, t]) => (
            <div key={n} style={{ display: "flex", gap: "0.7rem", marginBottom: "0.5rem", alignItems: "flex-start" }}>
              <span style={{ color: A, fontWeight: 700, flexShrink: 0, fontSize: "0.85rem", minWidth: "1rem" }}>{n}</span>
              <span style={{ color: "rgba(245,232,200,0.7)", fontSize: "0.82rem", lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zurück */}
      <a href="/flyer" style={{
        color: "rgba(245,232,200,0.3)", fontFamily: "'Lora', serif", fontStyle: "italic",
        fontSize: "0.8rem", textDecoration: "none", marginTop: "0.5rem",
      }}>
        ← Zurück zur Flyer-Vorschau
      </a>

      {/* ═══════════════════════════════════════════════════════════
          OFF-SCREEN: PDF-capture Spreads
          Weiße Hintergründe, Canvas-QR (html2canvas-kompatibel)
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ position: "fixed", top: -9999, left: -9999, pointerEvents: "none", zIndex: -1, overflow: "hidden" }}>

        {/* SPREAD 1 — Außenseite */}
        <div ref={el => { refs.current[0] = el; }}
          style={{ width: CW, height: CH, display: "flex", flexDirection: "row", overflow: "hidden", background: "#fff" }}>

          {/* Seite 4 — BoomerClub */}
          <div style={{ width: PW, height: CH, flexShrink: 0, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "7%", boxSizing: "border-box", overflow: "hidden" }}>
            <div>
              <p style={{ fontFamily: "Lora, Georgia, serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: A2, margin: "0 0 8px" }}>
                Der BoomerClub Emmerich
              </p>
              <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 24, color: A2, lineHeight: 1.1, marginBottom: 16 }}>
                Gegründet 2024 — an der Theke der Societät.
              </div>
            </div>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 10.5, color: "#1a0e04", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 8px" }}>
                Rund <strong style={{ color: A2 }}>130 Leute</strong> aus Emmerich und Umgebung sind dabei. Manche kommen zu den gemütlichen Treffen — alle vier bis sechs Monate, etwa dreimal im Jahr.
              </p>
              <p style={{ margin: 0 }}>
                Andere verfolgen einfach, was so passiert — direkt über WhatsApp. Beides ist vollkommen richtig. Passt doch.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#fff", border: "1px solid #ddd", padding: 4, borderRadius: 4, lineHeight: 0, flexShrink: 0 }}>
                  <QRCodeCanvas value={SITE_URL} size={52} bgColor="#fff" fgColor={BG} level="M" />
                </div>
                <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 9, color: A2, lineHeight: 1.4 }}>
                  emmerich-boomt.replit.app<br />
                  <span style={{ color: "#5a3a10", fontSize: 8 }}>Zur Party-Website</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#fff", border: "1px solid #ddd", padding: 4, borderRadius: 4, lineHeight: 0, flexShrink: 0 }}>
                  <QRCodeCanvas value={WA_URL} size={52} bgColor="#fff" fgColor="#075e54" level="M" />
                </div>
                <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 9, color: "#075e54", lineHeight: 1.4 }}>
                  WhatsApp-Gruppe<br />
                  <span style={{ fontSize: 8 }}>BoomerClub Emmerich</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trennlinie */}
          <div style={{ width: 1, background: "#ddd", flexShrink: 0 }} />

          {/* Seite 1 — Deckblatt */}
          <div style={{ width: PW, height: CH, flexShrink: 0, position: "relative", overflow: "hidden", background: "#E8891A" }}>
            <img src="/boomerparty-foto.jpeg" alt="Party"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "linear-gradient(to bottom,rgba(232,137,26,0.95) 55%,transparent)", padding: "8% 8% 14%", textAlign: "center" }}>
              <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontWeight: 900, fontSize: 40, lineHeight: 0.9, color: "#fff", textTransform: "uppercase" }}>
                EMMERICH<br />BOOMT!
              </div>
              <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 11, color: "#3a1a00", letterSpacing: 2, textTransform: "uppercase", marginTop: "5%", opacity: 0.9 }}>
                Die BoomerParty
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top,rgba(140,70,5,0.95) 55%,transparent)", padding: "12% 8% 6%", textAlign: "center" }}>
              <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, fontSize: 19, color: "#fff", textTransform: "uppercase", lineHeight: 1.2 }}>
                Samstag, 18. Juli 2026
              </div>
              <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 10, color: "#fff", opacity: 0.9, marginTop: "3%" }}>
                Bölt / Kapaunenberg · Emmerich am Rhein
              </div>
            </div>
          </div>
        </div>

        {/* SPREAD 2 — Innenseite */}
        <div ref={el => { refs.current[1] = el; }}
          style={{ width: CW, height: CH, display: "flex", flexDirection: "row", overflow: "hidden", background: "#fff" }}>

          {/* Seite 2 — Geschichte */}
          <div style={{ width: PW, height: CH, flexShrink: 0, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "7%", gap: 10, boxSizing: "border-box", overflow: "hidden" }}>
            <p style={{ fontFamily: "Lora, Georgia, serif", fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: A2, margin: 0 }}>
              Emmerich, Frühjahr 2026
            </p>
            <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: A2, lineHeight: 1.1 }}>
              Am 18. Juli 2026 gibt es eine Party. Auf dem Bölt. Und die wird gut.
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Abrocken — zu Musik, bei der man den Text noch kann",
                "70er, 80er und Aktuelles — laut, tanzbar, zum Mitsingen",
                "Alte Freunde treffen — manche vielleicht nach Jahren",
                "Gespräche an der Theke — die irgendwie immer die besten sind",
                "Nostalgie — aber die gute Art, bei der einem warm ums Herz wird",
                "Fingerfood, Getränke — kein Dresscode, ganz zwanglos",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 6, fontFamily: "Lora, Georgia, serif", fontSize: 10, color: "#1a0e04", lineHeight: 1.55 }}>
                  <span style={{ color: A2, flexShrink: 0 }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 9, color: "#3a2810", lineHeight: 1.55, padding: "6px 10px", background: "#f5eedd", borderLeft: `2px solid #e0c070`, borderRadius: "0 3px 3px 0" }}>
              Das wird eine geschlossene Gesellschaft — kein offenes Stadtfest. Wer sich angesprochen fühlt, ist dabei. Und wer jemanden kennt: <strong style={{ color: A2 }}>gerne weitersagen.</strong>
            </div>
          </div>

          {/* Trennlinie */}
          <div style={{ width: 1, background: "#ddd", flexShrink: 0 }} />

          {/* Seite 3 — Prozess */}
          <div style={{ width: PW, height: CH, flexShrink: 0, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "7%", gap: 12, boxSizing: "border-box", overflow: "hidden" }}>
            <p style={{ fontFamily: "Lora, Georgia, serif", fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: A2, margin: 0 }}>
              So seid ihr dabei
            </p>
            <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: A2, lineHeight: 1.1 }}>
              Dabei sein ist alles.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                ["1", "Jetzt verbindlich anmelden", "QR-Code scannen oder auf www.emmerich-boomt.de — 10 € pro Person, bis 30. Juni 2026."],
                ["2", "Beitrag zahlen & Ticket erhalten", "Per Überweisung oder PayPal. Das Ticket kommt personifiziert per Mail."],
              ] as [string,string,string][]).map(([n, title, text]) => (
                <div key={n} style={{ display: "flex", gap: 10, padding: "8px 10px", background: "#f5ede0", borderRadius: 4, border: "1px solid #e0c070" }}>
                  <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontWeight: 900, fontSize: 26, color: A2, lineHeight: 1, flexShrink: 0, minWidth: 18, textAlign: "center" }}>{n}</span>
                  <div>
                    <div style={{ fontFamily: "Lora, Georgia, serif", fontWeight: 700, fontSize: 10.5, color: "#1a0e04", marginBottom: 3 }}>{title}</div>
                    <div style={{ fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 9.5, color: "#3a2810" }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#f5ede0", borderRadius: 6, border: `1px solid ${A2}` }}>
              <div style={{ background: "#fff", padding: 4, borderRadius: 4, lineHeight: 0, flexShrink: 0, border: "1px solid #ddd" }}>
                <QRCodeCanvas value={SITE_URL} size={60} bgColor="#fff" fgColor="#0a0704" level="H" />
              </div>
              <div>
                <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontStyle: "italic", fontSize: 13, color: A2, fontWeight: 700 }}>
                  Jetzt verbindlich anmelden
                </div>
                <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 9, color: "#3a2810", marginTop: 3 }}>
                  www.emmerich-boomt.de
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* /off-screen */}
    </div>
  );
}
