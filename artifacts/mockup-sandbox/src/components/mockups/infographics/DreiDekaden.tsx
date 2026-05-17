const DEKADEN = [
  {
    label: "70er",
    color: "#E8991A",
    items: [
      { icon: "♪", title: "ABBA gewinnt den Eurovision", desc: "1974 — Waterloo. Vier Schweden verändern den Dancefloor für immer." },
      { icon: "✦", title: "Disco und Schlaghose", desc: "Die Tanzfläche gehörte dem Groove. Der Stil gehörte den Beinen." },
      { icon: "📺", title: "Rockpalast — Nachts im Westen", desc: "WDR sendete live durch die Nacht. Das war Fernsehen." },
      { icon: "⌗", title: "Taschenrechner-Wunder", desc: "8 Ziffern in der Hosentasche. Kinder hielten es für Magie." },
    ],
  },
  {
    label: "80er",
    color: "#c47a10",
    items: [
      { icon: "🎧", title: "Walkman revolutioniert den Schulweg", desc: "Sony, 1979. Plötzlich hatte jeder seinen eigenen Soundtrack." },
      { icon: "🎤", title: "Neue Deutsche Welle", desc: "Nena, Peter Schilling — Deutschland klang plötzlich nach Zukunft." },
      { icon: "💻", title: "Commodore 64", desc: "64 Kilobyte. Man konnte damit alles machen — wenn man wusste wie." },
      { icon: "🏃", title: "Aerobic und Leggins", desc: "Jane Fonda machte Leggins zur Alltagskleidung. Dauerhaft." },
    ],
  },
  {
    label: "90er",
    color: "#a86200",
    items: [
      { icon: "🎸", title: "Grunge aus Seattle", desc: "Nirvana, Pearl Jam — auf einmal war zerrissen modern." },
      { icon: "🥚", title: "Tamagotchi", desc: "1996. Millionen Kinder pflegten ein Pixel-Huhn. Mit Hingabe." },
      { icon: "🌐", title: "Das Internet zu Hause", desc: "Das Modem pfiff. Die Leitung war besetzt. Die Welt wurde klein." },
      { icon: "📡", title: "Wer wird Millionär?", desc: "1999. Günther Jauch fragte. Das ganze Land schaute zu." },
    ],
  },
];

export default function DreiDekaden() {
  return (
    <div
      style={{
        width: "1000px",
        minHeight: "100vh",
        background: "#0A0704",
        fontFamily: "'Georgia', serif",
        padding: "60px 64px 80px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <p style={{ fontFamily: "'Georgia', serif", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#E8991A", margin: "0 0 12px" }}>
          EMMERICH BOOMT! · 18. JULI 2026
        </p>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "48px", fontWeight: 700, color: "#F5E8C8", margin: "0 0 16px", lineHeight: 1.1 }}>
          Die drei Dekaden
        </h1>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "15px", color: "rgba(245,232,200,0.55)", margin: 0 }}>
          70er · 80er · 90er — die Ären, die den Abend prägen
        </p>
        <div style={{ width: "48px", height: "2px", background: "#E8991A", margin: "24px auto 0", opacity: 0.7 }} />
      </div>

      {/* Dekaden */}
      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {DEKADEN.map((dekade) => (
          <div key={dekade.label}>
            {/* Dekade-Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: dekade.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: "18px", color: "#0A0704" }}>
                  {dekade.label}
                </span>
              </div>
              <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${dekade.color}60, transparent)` }} />
            </div>

            {/* Items Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingLeft: "0" }}>
              {dekade.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(245,232,200,0.04)",
                    border: `1px solid rgba(232,153,26,0.12)`,
                    borderRadius: "8px",
                    padding: "20px 22px",
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: "14px", color: "#F5E8C8", margin: "0 0 6px", lineHeight: 1.35 }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(245,232,200,0.5)", margin: 0, lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "56px", paddingTop: "32px", borderTop: "1px solid rgba(232,153,26,0.15)" }}>
        <p style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "13px", color: "rgba(245,232,200,0.35)", margin: 0 }}>
          Bölt / Kapaunenberg · Emmerich am Rhein · Samstag, 18. Juli 2026
        </p>
      </div>
    </div>
  );
}
