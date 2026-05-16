const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function navigate(path: string) {
  window.history.pushState({}, "", `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const PROGRAMM: { zeit: string; text: string }[] = [
  {
    zeit: "19:00 Uhr — Einlass",
    text: "Erste Begrüßungen. Erste \u201eDu bist ja gar nicht so alt geworden!\u201c-Sprüche.",
  },
  {
    zeit: "19:30 Uhr — Erste verlorene Brille",
    text: "Erfahrungsgemäß landet die erste Lesebrille gegen halb acht unauffindbar zwischen den Stühlen.",
  },
  {
    zeit: "20:00 Uhr — \u201eDas hätte es früher nicht gegeben\u201c",
    text: "Statistisch zu erwartender erster Spruch dieser Art. Wer ihn sagt, gibt eine Runde aus.",
  },
  {
    zeit: "20:30 Uhr — Erste Tanzversuche",
    text: "Vorsichtig, mit dem Getränk in der Hand, am Tisch.",
  },
  {
    zeit: "21:00 Uhr — ABBA-Block",
    text: "Der DJ traut sich.",
  },
  {
    zeit: "21:45 Uhr — Plötzlich erinnert sich jemand an die 80er",
    text: "Geschichten kommen heraus, die seit 30 Jahren niemand mehr erzählt hat.",
  },
  {
    zeit: "22:30 Uhr — Wie spät ist es eigentlich?",
    text: "Erste Verwirrung über die Uhrzeit. Niemand will gehen.",
  },
  {
    zeit: "23:30 Uhr — Die Tanzfläche füllt sich",
    text: "Hüftgelenke werden auf die Probe gestellt.",
  },
  {
    zeit: "00:30 Uhr — Letzter Tanz, dachten wir",
    text: "\u201eTime of My Life\u201c oder \u201eNothing Else Matters\u201c — der DJ entscheidet kurzfristig. Es wird nicht der letzte sein.",
  },
  {
    zeit: "01:00 Uhr — Niemand redet mehr über die Uhrzeit",
    text: "Sie hat aufgehört, eine Rolle zu spielen.",
  },
  {
    zeit: "03:00 Uhr — Erste leise Beobachtung am Fenster",
    text: "Wird's draußen schon wieder hell?",
  },
  {
    zeit: "Irgendwann später — Heimweg",
    text: "Mit dem Versprechen: Das machen wir nochmal.",
  },
];

export default function ProgrammPage() {
  return (
    <div
      style={{
        background: "#0A0704",
        minHeight: "100svh",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* ── Headline-Block ── */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#E8991A",
              margin: "0 0 8px",
            }}
          >
            DER ABEND
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "42px",
              fontWeight: 500,
              color: "#F5E8C8",
              margin: "0 0 24px",
              lineHeight: 1.15,
            }}
          >
            Wie der Abend wird
          </h1>
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "14px",
              fontStyle: "italic",
              color: "rgba(245,232,200,0.6)",
              margin: 0,
            }}
          >
            Vorsichtig, nicht verbindlich — eher eine Prognose als ein Plan.
          </p>
        </div>

        {/* ── Programm-Liste ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", marginBottom: "64px" }}>
          {PROGRAMM.map((p, i) => (
            <div key={i}>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "#E8991A",
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                }}
              >
                {p.zeit}
              </p>
              <p
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "15px",
                  color: "rgba(245,232,200,0.85)",
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {/* ── Abschluss ── */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "80px",
              height: "1px",
              background: "#E8991A",
              opacity: 0.4,
              margin: "0 auto 24px",
            }}
          />
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "13px",
              fontStyle: "italic",
              color: "rgba(245,232,200,0.5)",
              margin: "0 0 64px",
            }}
          >
            Alle Angaben ohne Gewähr. Außer dem Versprechen.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "13px",
              color: "#E8991A",
              padding: 0,
            }}
          >
            ← Zurück
          </button>
        </div>

      </div>
    </div>
  );
}
