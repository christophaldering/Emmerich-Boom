import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

export default function Anmeldung() {
  const ref = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    personen: "1",
    nachricht: "",
    zustimmung: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [target.name]: target.type === "checkbox" ? target.checked : target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = {
    background: "hsl(268 35% 11%)",
    border: "1px solid hsl(268 28% 24%)",
    borderRadius: "0.375rem",
    color: "hsl(40 25% 84%)",
    padding: "0.75rem 1rem",
    width: "100%",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "500",
    marginBottom: "0.4rem",
    color: "hsl(40 15% 58%)",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };

  return (
    <section id="anmeldung" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 45% 7%)" }}>
      <div className="max-w-2xl mx-auto px-5 md:px-8">
        <div className="reveal mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Dabei sein
          </h2>
        </div>

        <p className="reveal reveal-delay-1 text-base leading-relaxed mb-10" style={{ color: "hsl(40 20% 66%)" }}>
          Die Veranstaltung ist als geschlossene Gesellschaft geplant.
          Deshalb bitten wir um eine verbindliche Anmeldung.
        </p>

        {submitted ? (
          <div
            className="reveal rounded-lg border p-8 text-center"
            style={{ background: "hsl(268 35% 11%)", borderColor: "hsl(38 88% 54% / 0.4)" }}
          >
            <div className="text-3xl mb-4" style={{ color: "var(--gold)" }}>✦</div>
            <p className="text-lg font-semibold mb-2" style={{ color: "hsl(40 25% 86%)" }}>
              Anmeldung eingegangen.
            </p>
            <p className="text-sm" style={{ color: "hsl(40 15% 56%)" }}>
              Früher hat man sich angerufen. Heute meldet man sich hier an.
            </p>
          </div>
        ) : (
          <form className="reveal reveal-delay-2 space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vorname" style={labelStyle}>Vorname</label>
                <input
                  id="vorname"
                  name="vorname"
                  type="text"
                  required
                  value={form.vorname}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
                />
              </div>
              <div>
                <label htmlFor="nachname" style={labelStyle}>Nachname</label>
                <input
                  id="nachname"
                  name="nachname"
                  type="text"
                  required
                  value={form.nachname}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={labelStyle}>E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
              />
            </div>

            <div>
              <label htmlFor="telefon" style={labelStyle}>Telefonnummer (optional)</label>
              <input
                id="telefon"
                name="telefon"
                type="tel"
                value={form.telefon}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
              />
            </div>

            <div>
              <label htmlFor="personen" style={labelStyle}>Anzahl Personen</label>
              <select
                id="personen"
                name="personen"
                value={form.personen}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n} style={{ background: "hsl(268 35% 11%)" }}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nachricht" style={labelStyle}>Nachricht (optional)</label>
              <textarea
                id="nachricht"
                name="nachricht"
                rows={4}
                value={form.nachricht}
                onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(268 28% 24%)")}
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="zustimmung"
                name="zustimmung"
                type="checkbox"
                required
                checked={form.zustimmung}
                onChange={handleChange}
                className="mt-1 shrink-0"
                style={{ accentColor: "var(--gold)", width: "1rem", height: "1rem" }}
              />
              <label htmlFor="zustimmung" className="text-sm leading-relaxed cursor-pointer" style={{ color: "hsl(40 15% 58%)" }}>
                Ich habe die Hinweise zur Anmeldung zur Kenntnis genommen.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded text-sm font-semibold transition-all duration-200"
              style={{ background: "var(--gold)", color: "hsl(268 45% 7%)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "hsl(38 88% 62%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold)")}
            >
              Verbindlich anmelden
            </button>

            <p className="text-center text-sm" style={{ color: "hsl(40 15% 50%)" }}>
              Teilnahmebeitrag: <span style={{ color: "var(--gold)" }}>10 Euro</span>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
