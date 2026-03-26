import { useState, useEffect } from "react";
import { useReveal } from "@/hooks/useReveal";

const STORAGE_KEY = "emmerich_boomt_submitted";

function AlreadySubmitted() {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--amber)" }}>✦</div>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "1.4rem",
          color: "var(--warm)",
          marginBottom: "0.75rem",
        }}
      >
        Klasse. Daumen hoch angekommen.
      </h3>
      <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.75)", lineHeight: 1.7, marginBottom: "2rem" }}>
        Das Orga-Team freut sich. Im Mai melden wir uns mit allen Details.
      </p>
      <div
        style={{
          borderTop: "1px solid rgba(232,153,26,0.2)",
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.15rem",
        }}
      >
        {["Von uns.", "Für uns.", "Wird Zeit."].map((line, i) => (
          <span
            key={i}
            style={{
              display: "block",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
              color: i === 1 ? "var(--amber)" : "var(--warm)",
              lineHeight: 1.4,
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

interface FormularProps {
  onSuccess?: () => void;
}

export default function Formular({ onSuccess }: FormularProps) {
  const ref = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    personen: "Nur ich",
    statement: "",
    song: "",
  });

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setSubmitted(true);
    }
  }, []);

  const inputStyle: React.CSSProperties = {
    background: "rgba(245,232,200,0.04)",
    border: "1px solid rgba(245,232,200,0.12)",
    borderRadius: "3px",
    color: "var(--warm)",
    padding: "0.75rem 0.9rem",
    fontSize: "1rem",
    fontFamily: "'Lora', serif",
    width: "100%",
    outline: "none",
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
        localStorage.setItem(STORAGE_KEY, "1");
        setSubmitted(true);
        onSuccess?.();
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
    <section
      id="anmeldung"
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 2rem 5rem" }}
    >
      <style>{`
        .formular-input::placeholder { color: rgba(245,232,200,0.45); }
        .formular-input:focus { border-color: rgba(232,153,26,0.55) !important; }
        .submit-btn:hover:not(:disabled) { background: var(--amber) !important; color: var(--black) !important; }
        .submit-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <h2
        className="reveal"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(1.6rem,4vw,2.2rem)",
          marginBottom: "1rem",
        }}
      >
        Kurz melden.
      </h2>

      <p
        className="reveal d1"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1rem",
          lineHeight: 1.8,
          color: "rgba(245,232,200,0.88)",
          marginBottom: "1.5rem",
        }}
      >
        Einfach kurz sagen: bin dabei. Jetzt noch kein Eintritt, keine Verpflichtung — hilft uns aber enorm zu wissen, wie viele wir werden.
      </p>

      <div
        className="reveal d1"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          background: "rgba(232,153,26,0.05)",
          border: "1px solid rgba(232,153,26,0.20)",
          borderRadius: "4px",
          padding: "0.9rem 1.1rem",
          marginBottom: "2rem",
          fontFamily: "'Lora', serif",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "rgba(245,232,200,0.85)",
        }}
      >
        <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>🔒</span>
        <span>
          <strong style={{ color: "var(--amber)", fontWeight: 600 }}>Kein richtiger Name nötig.</strong>{" "}
          Ein Spitzname reicht völlig — keine E-Mail, keine Adresse, nichts Persönliches.
        </span>
      </div>

      {submitted ? (
        <div className="reveal">
          <AlreadySubmitted />
        </div>
      ) : (
        <form className="reveal d2" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
          <div
            style={{
              background: "rgba(232,153,26,0.08)",
              border: "1px solid rgba(232,153,26,0.3)",
              borderRadius: "4px",
              padding: "1rem 1.3rem",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "rgba(245,232,200,0.8)",
            }}
          >
            <strong style={{ color: "var(--amber)", fontFamily: "'Lora', serif", fontWeight: 600 }}>
              Abgabe bis Ende April.
            </strong>{" "}
            Danach wissen wir, wie viele wir werden — und ob und wie der Abend stattfindet.
            Noch kein Eintritt, noch keine Verpflichtung.
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.8)", marginBottom: "0.5rem" }}>
              Vor- oder Spitzname{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,232,200,0.45)" }}>(reicht völlig)</em>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="z.B. Klaus, Uschi, Mausi ..."
              className="formular-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.8)", marginBottom: "0.5rem" }}>
              Ungefähr wie viele seid ihr?
            </label>
            <select
              name="personen"
              value={form.personen}
              onChange={handleChange}
              className="formular-input"
              style={inputStyle}
            >
              <option>Nur ich</option>
              <option>Wir zwei</option>
              <option>Wir drei</option>
              <option>Vier auf einen Streich</option>
              <option>Fünf oder mehr</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.8)", marginBottom: "0.5rem" }}>
              Kurzes Statement{" "}
              <em style={{ fontStyle: "italic", fontSize: "0.88rem", color: "rgba(245,232,200,0.45)" }}>(optional, aber gerne)</em>
            </label>
            <textarea
              name="statement"
              rows={3}
              value={form.statement}
              onChange={handleChange}
              placeholder={'Warum du dabei bist, was du dir erhoffst, oder einfach: "Bin dabei!"'}
              className="formular-input"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(245,232,200,0.8)", marginBottom: "0.5rem" }}>
              Dein Lieblingssong — der auf jeden Fall gespielt werden muss 🎵
            </label>
            <input
              type="text"
              name="song"
              value={form.song}
              onChange={handleChange}
              placeholder="z.B. ABBA – Dancing Queen, Nena – 99 Luftballons ..."
              className="formular-input"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              width: "100%",
              padding: "1rem",
              background: "transparent",
              border: "1px solid var(--amber)",
              borderRadius: "3px",
              color: "var(--amber)",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {loading ? "Wird gespeichert …" : "Daumen hoch — ich bin dabei! 👍"}
          </button>

          {error && (
            <div
              style={{
                background: "rgba(232,153,26,0.06)",
                border: "1px solid rgba(232,153,26,0.25)",
                borderRadius: "4px",
                padding: "0.9rem 1.1rem",
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                color: "var(--amber)",
                fontSize: "0.88rem",
                lineHeight: 1.7,
              }}
            >
              {error}
            </div>
          )}
        </form>
      )}
    </section>
  );
}
