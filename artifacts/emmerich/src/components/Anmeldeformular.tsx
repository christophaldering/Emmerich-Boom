import { useState } from "react";
import { PHASE2_CONFIG } from "@/config/phase2";
import { useSubmitAnmeldung } from "@workspace/api-client-react";

interface AnmeldeformularProps {
  onSuccess: (data: { anzahl: number; bezahlweg: string; personen: string[]; ticket_nummern: number[] }) => void;
}

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
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Lora', serif",
  fontSize: "1rem",
  color: "var(--fg-80)",
  marginBottom: "0.5rem",
};

const hintStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontStyle: "italic",
  fontSize: "0.85rem",
  color: "var(--fg-50)",
  marginTop: "0.4rem",
  lineHeight: 1.5,
};

export default function Anmeldeformular({ onSuccess }: AnmeldeformularProps) {
  const [personenAnzahl, setPersonen] = useState(1);
  const [personen, setPersonen_]      = useState<string[]>([""]);
  const [email, setEmail]             = useState("");
  const [telefon, setTelefon]         = useState("");
  const [bezahlweg, setBezahlweg]     = useState<"ueberweisung" | "paypal">("ueberweisung");
  const [song, setSong]               = useState("");
  const [statement, setStatement]     = useState("");
  const [verbindlich, setVerbindlich] = useState(false);
  const [clientError, setClientError] = useState("");

  const mutation = useSubmitAnmeldung();

  const handlePersonenChange = (n: number) => {
    setPersonen(n);
    setPersonen_((prev) =>
      Array.from({ length: n }, (_, i) => prev[i] ?? ""),
    );
  };

  const handlePersonName = (i: number, val: string) => {
    setPersonen_((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    if (!verbindlich) {
      setClientError("Bitte bestätigt die verbindliche Anmeldung.");
      return;
    }

    mutation.mutate(
      {
        data: {
          email:           email.trim(),
          telefon:         telefon.trim() || null,
          personen_anzahl: personenAnzahl,
          personen:        personen.map((p) => p.trim()),
          bezahlweg,
          song:            song.trim() || null,
          statement:       statement.trim() || null,
          verbindlich:     true,
        },
      },
      {
        onSuccess: (responseData) => {
          onSuccess({
            anzahl:          personenAnzahl,
            bezahlweg,
            personen:        personen.map((p) => p.trim()),
            ticket_nummern:  responseData.ticket_nummern ?? [],
          });
        },
        onError: (err) => {
          const msg =
            typeof err === "object" && err !== null && "data" in err
              ? ((err as { data?: { error?: string } }).data?.error ?? "Ein Fehler ist aufgetreten.")
              : "Verbindungsfehler. Bitte nochmal versuchen.";
          setClientError(msg);
        },
      },
    );
  };

  const MAX = PHASE2_CONFIG.MAX_PERSONEN_PRO_ANMELDUNG;
  const loading = mutation.isPending;

  return (
    <section
      id="anmeldeformular"
      style={{
        background: "var(--bg-section)",
        borderTop: "2px solid var(--amber-30)",
        borderBottom: "2px solid var(--amber-30)",
        padding: "4rem 0 5rem",
      }}
    >
      <style>{`
        .af-input::placeholder { color: var(--fg-45); }
        .af-input:focus { border-color: var(--amber-55) !important; }
        .af-submit:hover:not(:disabled) { filter: brightness(1.1); }
        .af-submit:disabled { opacity: 0.5; cursor: default; }
        .af-radio-label {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'Lora', serif;
          font-size: 1rem;
          color: var(--fg-85);
          cursor: pointer;
          padding: 0.5rem 0;
        }
        .af-radio-label input[type="radio"] {
          accent-color: var(--amber);
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
        }
        .af-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-family: 'Lora', serif;
          font-size: 0.95rem;
          line-height: 1.75;
          color: var(--fg-85);
          cursor: pointer;
        }
        .af-checkbox-label input[type="checkbox"] {
          accent-color: var(--amber);
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
      `}</style>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.78rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.7rem" }}>
            Verbindliche Anmeldung
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(2.2rem, 7vw, 3rem)", color: "var(--warm)", lineHeight: 1.15 }}>
            Seid ihr dabei?
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

          {/* Personenanzahl zuerst */}
          <div>
            <label style={labelStyle}>Wie viele kommen?</label>
            <input
              type="number"
              required
              min={1}
              max={MAX}
              value={personenAnzahl}
              onChange={(e) => handlePersonenChange(Math.min(MAX, Math.max(1, parseInt(e.target.value) || 1)))}
              className="af-input"
              style={{ ...inputStyle, width: "120px" }}
            />
          </div>

          {/* Immer genau personen_anzahl Namensfelder */}
          {Array.from({ length: personenAnzahl }).map((_, i) => (
            <div key={i}>
              <label style={labelStyle}>
                {personenAnzahl === 1 ? "Dein Name" : `${i + 1}. Person`}
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={personen[i] ?? ""}
                onChange={(e) => handlePersonName(i, e.target.value)}
                placeholder="Vor- und Nachname"
                className="af-input"
                style={inputStyle}
              />
            </div>
          ))}

          {/* E-Mail */}
          <div>
            <label style={labelStyle}>Eure Mailadresse</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              className="af-input"
              style={inputStyle}
            />
            <p style={hintStyle}>Wir schicken eure Tickets an diese Adresse.</p>
          </div>

          {/* Telefon */}
          <div>
            <label style={labelStyle}>Handy (optional)</label>
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="+49 …"
              className="af-input"
              style={inputStyle}
            />
            <p style={hintStyle}>Falls am 18. Juli was Kurzfristiges ist.</p>
          </div>

          {/* Bezahlweg */}
          <div>
            <label style={{ ...labelStyle, marginBottom: "0.8rem" }}>Wie wollt ihr zahlen?</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {(["ueberweisung", "paypal"] as const).map((opt) => (
                <label key={opt} className="af-radio-label">
                  <input
                    type="radio"
                    name="bezahlweg"
                    value={opt}
                    checked={bezahlweg === opt}
                    onChange={() => setBezahlweg(opt)}
                  />
                  {opt === "ueberweisung" && "Überweisung"}
                  {opt === "paypal" && "PayPal"}
                </label>
              ))}
            </div>
          </div>

          {/* Song */}
          <div>
            <label style={labelStyle}>Euer Song für die Playlist (optional)</label>
            <input
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="z.B. ABBA – Dancing Queen"
              className="af-input"
              style={inputStyle}
            />
            <p style={hintStyle}>Der DJ freut sich.</p>
          </div>

          {/* Statement */}
          <div>
            <label style={labelStyle}>Wollt ihr uns noch was sagen? (optional)</label>
            <textarea
              rows={3}
              maxLength={200}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Maximal 200 Zeichen"
              className="af-input"
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <p style={{ ...hintStyle, textAlign: "right" }}>{statement.length} / 200</p>
          </div>

          {/* Verbindlichkeits-Checkbox */}
          <div style={{ background: "var(--amber-05)", border: "1px solid var(--amber-22)", borderRadius: "4px", padding: "1rem 1.2rem" }}>
            <label className="af-checkbox-label">
              <input
                type="checkbox"
                required
                checked={verbindlich}
                onChange={(e) => setVerbindlich(e.target.checked)}
              />
              <span>
                Ja, wir melden uns verbindlich an. Wer nicht kommt, dem geht der Beitrag verloren — er fließt in Fingerfood und Musik für alle anderen.
              </span>
            </label>
          </div>

          {/* Betrag-Vorschau */}
          <div style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: "var(--fg-65)", lineHeight: 1.6, borderTop: "1px solid var(--fg-07)", paddingTop: "1rem" }}>
            Gesamtbetrag:{" "}
            <strong style={{ color: "var(--amber)", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
              {personenAnzahl * PHASE2_CONFIG.PREIS_PRO_PERSON} €
            </strong>{" "}
            ({personenAnzahl} × {PHASE2_CONFIG.PREIS_PRO_PERSON} €)
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="af-submit"
            style={{
              width: "100%",
              padding: "1.1rem",
              background: "var(--amber)",
              border: "none",
              borderRadius: "3px",
              color: "var(--black)",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "filter 0.2s",
            }}
          >
            {loading ? "Wird gespeichert …" : "Jetzt verbindlich anmelden"}
          </button>

          {clientError && (
            <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {clientError}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
