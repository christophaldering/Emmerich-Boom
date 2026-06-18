import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const BG  = "#0A0704";
const A   = "#E8991A";
const FG  = "#F5E8C8";

export default function Wartelisteformular() {
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [anzahl, setAnzahl]         = useState(1);
  const [status, setStatus]         = useState<"idle" | "sending" | "ok" | "doppelt" | "fehler">("idle");

  async function absenden() {
    if (!name.trim() || !email.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`${BASE}/api/warteliste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), anzahl_karten: anzahl }),
      });
      if (res.status === 201) { setStatus("ok"); return; }
      if (res.status === 409) { setStatus("doppelt"); return; }
      setStatus("fehler");
    } catch {
      setStatus("fehler");
    }
  }

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(245,232,200,0.05)",
    border: `1px solid rgba(232,153,26,0.3)`,
    borderRadius: "4px",
    color: FG,
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "1rem",
    padding: "0.65rem 0.9rem",
    outline: "none",
    marginTop: "0.35rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Lora', Georgia, serif",
    fontSize: "0.82rem",
    color: `rgba(245,232,200,0.55)`,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "0",
  };

  if (status === "ok") {
    return (
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2.5rem 2rem", background: BG }}>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "1.05rem",
          color: FG,
          lineHeight: 1.75,
          borderLeft: `3px solid ${A}`,
          paddingLeft: "1.2rem",
          margin: 0,
        }}>
          Du stehst auf der Warteliste. Wir melden uns, sobald ein Platz frei wird.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 2rem 3rem", background: BG }}>
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 800,
        fontStyle: "italic",
        fontSize: "clamp(1.5rem, 4vw, 2rem)",
        color: A,
        margin: "0 0 0.75rem",
        lineHeight: 1.2,
      }}>
        Die Party ist ausgebucht.
      </h2>

      <p style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: "0.97rem",
        color: `rgba(245,232,200,0.75)`,
        lineHeight: 1.75,
        margin: "0 0 2rem",
      }}>
        Alle Plätze sind aktuell vergeben. Trag dich auf die Warteliste ein — wird ein Platz
        frei, laden wir der Reihe nach nach und du bekommst eine persönliche Einladung per Mail.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <label style={labelStyle}>
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein Name"
            style={inputStyle}
            disabled={status === "sending"}
          />
        </label>

        <label style={labelStyle}>
          E-Mail
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="deine@mail.de"
            style={inputStyle}
            disabled={status === "sending"}
          />
        </label>

        <label style={labelStyle}>
          Anzahl gewünschter Karten
          <select
            value={anzahl}
            onChange={e => setAnzahl(Number(e.target.value))}
            style={{ ...inputStyle, cursor: "pointer" }}
            disabled={status === "sending"}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n} style={{ background: BG, color: FG }}>{n}</option>
            ))}
          </select>
        </label>

        <button
          onClick={absenden}
          disabled={status === "sending" || !name.trim() || !email.trim()}
          style={{
            marginTop: "0.25rem",
            padding: "0.8rem 1.8rem",
            background: A,
            border: "none",
            borderRadius: "4px",
            color: BG,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 800,
            fontSize: "1.05rem",
            cursor: status === "sending" ? "wait" : "pointer",
            opacity: (status === "sending" || !name.trim() || !email.trim()) ? 0.6 : 1,
            alignSelf: "flex-start",
            transition: "opacity 0.15s",
          }}
        >
          {status === "sending" ? "Einen Moment …" : "Auf die Warteliste"}
        </button>

        {status === "doppelt" && (
          <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.9rem", color: `rgba(245,232,200,0.65)`, margin: 0, fontStyle: "italic" }}>
            Diese E-Mail-Adresse steht schon auf der Warteliste.
          </p>
        )}
        {status === "fehler" && (
          <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "0.9rem", color: `rgba(245,232,200,0.55)`, margin: 0, fontStyle: "italic" }}>
            Das hat gerade nicht geklappt — bitte später nochmal.
          </p>
        )}
      </div>
    </div>
  );
}
