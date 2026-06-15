import { useState } from "react";
import { PHASE2_CONFIG } from "@/config/phase2";
import { useSubmitAnmeldung, useGetAnmeldungStats } from "@workspace/api-client-react";

interface AnmeldeformularProps {
  onSuccess: (data: { anzahl: number; personen: string[]; ticket_nummern: number[] }) => void;
  initialEmail?: string;
  nachrueckerToken?: string;
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

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

function WartelisteBereich() {
  const [wlEmail, setWlEmail] = useState("");
  const [wlStatus, setWlStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleWlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWlStatus("loading");
    try {
      const res = await fetch(`${BASE_URL}/api/warteliste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wlEmail.trim() }),
      });
      if (res.status === 409) {
        setWlStatus("duplicate");
        return;
      }
      if (!res.ok) {
        setWlStatus("error");
        return;
      }
      setWlStatus("success");
    } catch {
      setWlStatus("error");
    }
  };

  if (wlStatus === "success") {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
        <div style={{ fontSize: "1.8rem", color: "var(--amber)", marginBottom: "1rem" }}>✦</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontStyle: "italic", fontSize: "1.4rem", color: "var(--warm)", marginBottom: "0.75rem", lineHeight: 1.25 }}>
          Du stehst auf der Warteliste.
        </h3>
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.98rem", color: "var(--fg-70)", lineHeight: 1.75 }}>
          Wir melden uns — versprochen, ohne Umwege.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Text B */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", lineHeight: 1.8, color: "var(--fg-85)", margin: "0 0 1.1rem" }}>
          Wir hatten uns so sehr gewünscht, dass dieser Abend etwas wird.
          Dass er das offenbar schon ist, bevor er begonnen hat — das freut uns von Herzen.
          Und macht es uns gleichzeitig so schwer, Nein zu sagen.
        </p>
        <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", lineHeight: 1.8, color: "var(--fg-85)", margin: 0 }}>
          Alle 275 Plätze sind vergeben. Wer trotzdem noch dabei sein möchte,
          kann sich auf die Warteliste setzen lassen. Wenn ein Platz frei wird,
          melden wir uns — versprochen, ohne Umwege.
        </p>
      </div>

      <form onSubmit={handleWlSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <div>
          <label style={labelStyle}>E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={wlEmail}
            onChange={(e) => setWlEmail(e.target.value)}
            placeholder="name@beispiel.de"
            className="af-input"
            style={inputStyle}
            disabled={wlStatus === "loading"}
          />
          <p style={hintStyle}>Sobald ein Platz frei wird, melden wir uns — ohne weitere Rückfrage.</p>
        </div>

        <button
          type="submit"
          disabled={wlStatus === "loading"}
          className="af-submit"
          style={{
            width: "100%",
            padding: "1.1rem",
            background: "transparent",
            border: "2px solid var(--amber)",
            borderRadius: "3px",
            color: "var(--amber)",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "1.05rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: wlStatus === "loading" ? 0.5 : 1,
          }}
        >
          {wlStatus === "loading" ? "Wird eingetragen …" : "Auf die Warteliste"}
        </button>

        {wlStatus === "duplicate" && (
          <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            Diese E-Mail steht bereits auf der Warteliste.
          </div>
        )}
        {wlStatus === "error" && (
          <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            Etwas ist schiefgelaufen. Bitte nochmal versuchen.
          </div>
        )}
      </form>
    </>
  );
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Anmeldeformular({ onSuccess, initialEmail, nachrueckerToken }: AnmeldeformularProps) {
  const [personenAnzahl, setPersonen] = useState(1);
  const [anzahlInput, setAnzahlInput] = useState("1");
  const [personen, setPersonen_]      = useState<string[]>([""]);
  const [email, setEmail]             = useState(initialEmail ?? "");
  const [telefon, setTelefon]         = useState("");
  const [song, setSong]               = useState("");
  const [statement, setStatement]     = useState("");
  const [verbindlich, setVerbindlich] = useState(false);
  const [clientError, setClientError] = useState("");
  const [nachrueckerLoading, setNachrueckerLoading] = useState(false);

  const mutation = useSubmitAnmeldung();
  const { data: stats } = useGetAnmeldungStats({ query: { refetchInterval: 60_000 } });

  const verfuegbar = stats?.verfuegbar ?? null;
  const kapazitaet = stats?.kapazitaet ?? 275;
  const ausgebucht = nachrueckerToken ? false : (verfuegbar !== null && verfuegbar === 0);

  const handlePersonenChange = (n: number) => {
    setPersonen(n);
    setPersonen_((prev) =>
      Array.from({ length: n }, (_, i) => prev[i] ?? ""),
    );
  };

  const handleAnzahlBlur = (MAX: number) => {
    const parsed = parseInt(anzahlInput);
    const clamped = isNaN(parsed) ? 1 : Math.min(MAX, Math.max(1, parsed));
    setAnzahlInput(String(clamped));
    handlePersonenChange(clamped);
  };

  const handlePersonName = (i: number, val: string) => {
    setPersonen_((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    if (!verbindlich) {
      setClientError("Bitte bestätigt die verbindliche Anmeldung.");
      return;
    }

    const formData = {
      email:           email.trim(),
      telefon:         telefon.trim() || null,
      personen_anzahl: personenAnzahl,
      personen:        personen.map((p) => p.trim()),
      song:            song.trim() || null,
      statement:       statement.trim() || null,
      verbindlich:     true as const,
    };

    if (nachrueckerToken) {
      setNachrueckerLoading(true);
      try {
        const r = await fetch(`${BASE}/api/anmeldung`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, nachruecker_token: nachrueckerToken }),
        });
        const d = await r.json() as { id?: number; ticket_nummern?: number[]; error?: string; message?: string };
        if (r.ok) {
          onSuccess({
            anzahl:         personenAnzahl,
            personen:       personen.map((p) => p.trim()),
            ticket_nummern: d.ticket_nummern ?? [],
          });
        } else {
          setClientError(d.message ?? d.error ?? "Ein Fehler ist aufgetreten.");
        }
      } catch {
        setClientError("Verbindungsfehler. Bitte nochmal versuchen.");
      } finally {
        setNachrueckerLoading(false);
      }
      return;
    }

    mutation.mutate(
      { data: formData },
      {
        onSuccess: (responseData) => {
          onSuccess({
            anzahl:          personenAnzahl,
            personen:        personen.map((p) => p.trim()),
            ticket_nummern:  responseData.ticket_nummern ?? [],
          });
        },
        onError: (err) => {
          if (typeof err === "object" && err !== null && "status" in err && (err as { status?: number }).status === 409) {
            const errData = (err as { data?: { error?: string } }).data;
            if (errData?.error === "ausgebucht") {
              setClientError("Leider sind gerade keine Plätze mehr frei. Bitte die Seite neu laden.");
              return;
            }
            setClientError("duplicate");
            return;
          }
          const msg =
            typeof err === "object" && err !== null && "data" in err
              ? ((err as { data?: { message?: string; error?: string } }).data?.message
                  ?? (err as { data?: { error?: string } }).data?.error
                  ?? "Ein Fehler ist aufgetreten.")
              : "Verbindungsfehler. Bitte nochmal versuchen.";
          setClientError(msg);
        },
      },
    );
  };

  const MAX = PHASE2_CONFIG.MAX_PERSONEN_PRO_ANMELDUNG;
  const loading = mutation.isPending || nachrueckerLoading;

  return (
    <section
      id="anmeldeformular"
      style={{
        background: "var(--bg-section)",
        borderTop: "2px solid var(--amber-30)",
        borderBottom: "2px solid var(--amber-30)",
        padding: "2rem 0 5rem",
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

        {/* Text A — Kapazitäts-Hinweis (immer sichtbar solange Plätze frei) */}
        {!ausgebucht && stats && (
          <div style={{
            background: "var(--amber-05)",
            border: "1px solid var(--amber-22)",
            borderLeft: "3px solid var(--amber)",
            borderRadius: "0 4px 4px 0",
            padding: "1.2rem 1.4rem",
            marginBottom: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--fg-85)", margin: 0 }}>
              Wir sind eine Generation, die gelernt hat: Man kann nicht alles haben.
              Nicht jede Platte, nicht jeden Abend, nicht jeden Platz. Das Leben ist endlich — und manchmal auch der Saal.
            </p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--fg-85)", margin: 0 }}>
              Wir haben uns gefreut wie lange nicht mehr, als klar wurde, dass so viele von euch dabei sein wollen.
              Und wir haben uns schwer getan mit dem, was jetzt folgt: Mehr als <strong style={{ color: "var(--warm)" }}>275 Personen</strong> sind leider nicht drin.
              Die Umstände wollen es so — nicht wir.
            </p>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--amber)",
              margin: 0,
              letterSpacing: "0.01em",
            }}>
              Noch {verfuegbar} von {kapazitaet} Plätzen verfügbar.
            </p>
          </div>
        )}

        {ausgebucht ? (
          <>
            <div style={{ marginBottom: "2.5rem" }}>
              <span style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.78rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.7rem" }}>
                Ausgebucht
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(2.2rem, 7vw, 3rem)", color: "var(--warm)", lineHeight: 1.15 }}>
                Warteliste
              </h2>
            </div>
            <WartelisteBereich />
          </>
        ) : (
          <>
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
                  value={anzahlInput}
                  onChange={(e) => setAnzahlInput(e.target.value)}
                  onBlur={() => handleAnzahlBlur(MAX)}
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
                  onChange={(e) => { if (!initialEmail) setEmail(e.target.value); }}
                  readOnly={!!initialEmail}
                  placeholder="name@beispiel.de"
                  className="af-input"
                  style={{ ...inputStyle, ...(initialEmail ? { opacity: 0.7, cursor: "default" } : {}) }}
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

              {clientError === "duplicate" ? (
                <div style={{ background: "rgba(220,80,40,0.07)", border: "1px solid rgba(220,80,40,0.4)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "#e05a28", fontSize: "0.9rem", lineHeight: 1.75 }}>
                  Diese E-Mail-Adresse ist bereits angemeldet.{" "}
                  <a
                    href="mailto:Christoph.aldering@googlemail.com?subject=Änderung%20meiner%20Anmeldung&body=Hallo%20Christoph%2C%0A%0Aich%20möchte%20meine%20Buchung%20gerne%20ändern%3A%0A%0A"
                    style={{ color: "inherit", fontWeight: 600 }}
                  >
                    Christoph direkt schreiben
                  </a>
                  , falls du etwas ändern möchtest.
                </div>
              ) : clientError ? (
                <div style={{ background: "var(--amber-06)", border: "1px solid var(--amber-25)", borderRadius: "4px", padding: "0.9rem 1.1rem", fontFamily: "'Lora', serif", fontStyle: "italic", color: "var(--amber)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {clientError}
                </div>
              ) : null}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
