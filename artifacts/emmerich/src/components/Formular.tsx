import { useState } from "react";
import { PHASE2_CONFIG } from "@/config/phase2";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function navigateToAnmeldung() {
  window.history.pushState({}, "", `${BASE}/anmeldung`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const GESCHLOSSEN = PHASE2_CONFIG.PHASE1_BEENDET;

interface FormularProps {
  onSuccess?: (newId: number) => void;
}

export default function Formular({ onSuccess }: FormularProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", personen: "Nur ich", statement: "" });

  const inputStyle: React.CSSProperties = {
    background: "var(--fg-04)",
    border: "1px solid var(--fg-12)",
    borderRadius: "3px",
    color: "var(--warm)",
    padding: "0.75rem 0.9rem",
    fontSize: "1rem",
    fontFamily: "'Lora', serif",
    width: "100%",
    outline: "none",
    ...(GESCHLOSSEN ? { opacity: 0.4, cursor: "not-allowed" } : {}),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/interesse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onSuccess?.(data.id ?? 0);
      } else if (data.duplicate) {
        setError(data.message);
      } else {
        setError(data.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte nochmal versuchen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="anmeldung" style={{ background: "var(--bg-section)", borderTop: "2px solid var(--amber-30)", borderBottom: "2px solid var(--amber-30)", padding: "3rem 0 5rem" }}>
      <style>{`
        .formular-input::placeholder { color: var(--fg-45); }
        .formular-input:focus { border-color: var(--amber-55) !important; }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .submit-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem" }}>

        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.78rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.7rem" }}>
            Interessensbekundung
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(2.2rem, 7vw, 3.2rem)", color: "var(--warm)", lineHeight: 1.15, marginBottom: "0.6rem" }}>
            Bist du dabei?
          </h2>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "1rem", color: "var(--fg-75)", lineHeight: 1.7 }}>
            Statement hinterlassen — unverbindlich.
          </p>
        </div>

        {/* Geschlossen-Box — ersetzt Warnbox wenn Phase 1 beendet */}
        {GESCHLOSSEN ? (
          <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-30)", borderLeft: "3px solid var(--amber)", borderRadius: "0 4px 4px 0", padding: "1.1rem 1.3rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--fg-85)", margin: 0 }}>
              <strong style={{ color: "var(--warm)" }}>Die Interessensphase ist abgeschlossen.</strong>{" "}
              Du kannst dich jetzt direkt verbindlich anmelden und deinen Platz sichern.
            </p>
            <button
              type="button"
              onClick={navigateToAnmeldung}
              style={{ alignSelf: "flex-start", fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "var(--amber)", background: "transparent", border: "1px solid var(--amber-55)", borderRadius: "3px", padding: "0.5rem 1.2rem", cursor: "pointer" }}
            >
              → Zur verbindlichen Anmeldung
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "var(--amber-05)", border: "1px solid var(--amber-22)", borderRadius: "4px", padding: "0.9rem 1.1rem", marginBottom: "2rem", fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--fg-85)" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>🔒</span>
            <span>
              <strong style={{ color: "var(--amber)", fontWeight: 600 }}>Kein richtiger Name nötig.</strong>{" "}
              Ein Spitzname reicht völlig — keine E-Mail, keine Adresse, nichts Persönliches.
            </span>
          </div>
        )}

      {submitted ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--amber)" }}>✦</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: "var(--warm)", marginBottom: "0.75rem" }}>
            Klasse. Daumen hoch angekommen.
          </h3>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-75)", lineHeight: 1.7, marginBottom: "2rem" }}>
            Das Orga-Team freut sich. Für einen Platz jetzt verbindlich anmelden unter{" "}
            <a href="/anmeldung" style={{ color: "var(--amber)", textDecoration: "underline" }}>/anmeldung</a>.
          </p>
          <div style={{ borderTop: "1px solid var(--amber-20)", paddingTop: "2rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            {["Von uns.", "Für uns.", "Wird Zeit."].map((line, i) => (
              <span key={i} style={{ display: "block", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.4rem, 4.5vw, 2rem)", color: i === 1 ? "var(--amber)" : "var(--warm)", lineHeight: 1.4 }}>
                {line}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
          <div style={GESCHLOSSEN ? { pointerEvents: "none" } : {}}>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem", ...(GESCHLOSSEN ? { opacity: 0.45 } : {}) }}>
              Vor- oder Spitzname{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-45)" }}>(reicht völlig)</em>
            </label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="z.B. Klaus, Uschi, Mausi ..." className="formular-input" style={inputStyle} disabled={GESCHLOSSEN} />
          </div>

          <div style={GESCHLOSSEN ? { pointerEvents: "none" } : {}}>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem", ...(GESCHLOSSEN ? { opacity: 0.45 } : {}) }}>
              Ungefähr wie viele seid ihr?
            </label>
            <select name="personen" value={form.personen} onChange={handleChange} className="formular-input" style={inputStyle} disabled={GESCHLOSSEN}>
              <option>Nur ich</option>
              <option>Wir zwei</option>
              <option>Wir drei</option>
              <option>Vier auf einen Streich</option>
              <option>Fünf oder mehr</option>
            </select>
          </div>

          <div style={GESCHLOSSEN ? { pointerEvents: "none" } : {}}>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "var(--fg-80)", marginBottom: "0.5rem", ...(GESCHLOSSEN ? { opacity: 0.45 } : {}) }}>
              Kurzes Statement{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "var(--fg-45)" }}>(optional, aber gerne)</em>
            </label>
            <textarea name="statement" rows={3} value={form.statement} onChange={handleChange} placeholder={'Warum du dabei bist, was du dir erhoffst, oder einfach: "Bin dabei!"'} className="formular-input" style={{ ...inputStyle, resize: "vertical" }} disabled={GESCHLOSSEN} />
          </div>

          {/* Warnbox — nur wenn Phase 1 noch offen */}
          {!GESCHLOSSEN && (
            <div style={{ background: "var(--fg-03)", border: "1px solid var(--amber-30)", borderLeft: "3px solid var(--amber)", borderRadius: "0 4px 4px 0", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontFamily: "'Lora', serif", fontSize: "0.92rem", lineHeight: 1.7, color: "var(--fg-80)", margin: 0 }}>
                🔔 <strong style={{ color: "var(--warm)" }}>Das ist keine Anmeldung.</strong> Eine Interessensbekundung sichert dir keinen Platz. Um wirklich dabei zu sein, direkt verbindlich anmelden.
              </p>
              <button
                type="button"
                onClick={navigateToAnmeldung}
                style={{ alignSelf: "flex-start", fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "var(--amber)", background: "transparent", border: "1px solid var(--amber-55)", borderRadius: "3px", padding: "0.45rem 1.1rem", cursor: "pointer" }}
              >
                → Zur verbindlichen Anmeldung
              </button>
            </div>
          )}

          <button type="submit" disabled={loading || GESCHLOSSEN} className="submit-btn" style={{ width: "100%", padding: "1rem", background: "var(--amber)", border: "none", borderRadius: "3px", color: "var(--black)", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", fontWeight: 700, cursor: GESCHLOSSEN ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {GESCHLOSSEN ? "Interessensbekundung geschlossen" : loading ? "Wird gespeichert …" : "Bitte bestätigen! 👍"}
          </button>

          {error && (
            <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.88rem", lineHeight: 1.7 }}>
              {error}
            </div>
          )}
        </form>
      )}
      </div>
    </section>
  );
}
