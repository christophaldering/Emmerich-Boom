import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const SECRET = "emmerich-orga-stats-2026";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_PW = "#Boomer2026";
const PW_KEY = "emmerich_admin_auth";

const A  = "#e8991a";
const FG = "#f5e8c8";
const BG = "#0a0704";
const fg = (o: number) => `rgba(245,232,200,${o})`;
const am = (o: number) => `rgba(232,153,26,${o})`;

function dateFmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface AlleTicketsEntry {
  id: number;
  anmeldung_id: number;
  person_name: string;
  ticket_nummer: string;
  ticket_code: string;
  versendet_am: string | null;
  eingelassen_am: string | null;
  created_at: string;
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PW) { sessionStorage.setItem(PW_KEY, "1"); onAuth(); }
    else { setError(true); setInput(""); }
  };
  return (
    <div style={{ minHeight: "100svh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "320px" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.2rem", color: A, textAlign: "center", marginBottom: "0.5rem" }}>Ticket-Übersicht</p>
        <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }} placeholder="Passwort" autoFocus
          style={{ background: "rgba(245,232,200,0.07)", border: `1px solid ${error ? A : "rgba(245,232,200,0.2)"}`, borderRadius: "3px", color: FG, padding: "0.75rem 1rem", fontSize: "1rem", fontFamily: "'Lora', serif", outline: "none" }} />
        {error && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: A, textAlign: "center", margin: 0 }}>Falsches Passwort.</p>}
        <button type="submit" style={{ background: "transparent", border: `1px solid ${A}`, borderRadius: "3px", color: A, padding: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", cursor: "pointer" }}>Einloggen</button>
      </form>
    </div>
  );
}

export default function TicketUebersichtPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(PW_KEY) === "1");
  const [tickets, setTickets] = useState<AlleTicketsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${BASE}/api/admin/alle-tickets`, { headers: { "x-admin-secret": SECRET } });
      if (!r.ok) { setError("Fehler beim Laden"); return; }
      const data = await r.json();
      if (Array.isArray(data)) setTickets(data as AlleTicketsEntry[]);
    } catch {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) void load(); }, [authed, load]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const versendet   = tickets.filter(t => t.versendet_am).length;
  const eingelassen = tickets.filter(t => t.eingelassen_am).length;

  return (
    <div style={{ background: BG, color: FG, minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem 1.5rem", maxWidth: "820px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.4rem,4vw,2rem)", color: A, lineHeight: 1.2, margin: 0 }}>
          Ticket-Übersicht
        </h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <a href={`${BASE}/boomer-orga-intern`} style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "3px", color: am(0.85), textDecoration: "none", fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem" }}>
            ← Orga
          </a>
          <button onClick={() => void load()} disabled={loading} style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "3px", color: am(0.85), cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem" }}>
            {loading ? "…" : "Aktualisieren"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#e74c3c", fontFamily: "'Lora', serif", marginBottom: "1rem" }}>{error}</p>}

      {/* Summary */}
      {tickets.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.7rem", marginBottom: "2rem" }}>
          {[
            { n: tickets.length,  label: "Tickets gesamt" },
            { n: versendet,       label: "Versendet" },
            { n: tickets.length - versendet, label: "Noch nicht versendet" },
            { n: eingelassen,     label: "Eingelassen" },
          ].map(({ n, label }) => (
            <div key={label} style={{ background: am(0.06), border: `1px solid ${am(0.25)}`, borderRadius: "6px", padding: "1rem 1.2rem" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem", color: A, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: "0.82rem", color: fg(0.7), marginTop: "0.35rem" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket-Liste */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.15rem", color: A, marginBottom: "1rem", borderBottom: `1px solid ${am(0.25)}`, paddingBottom: "0.4rem" }}>
        Generierte Tickets ({tickets.length})
      </h2>

      {loading && tickets.length === 0 && (
        <p style={{ color: fg(0.55), fontStyle: "italic", fontSize: "0.88rem" }}>Lädt …</p>
      )}

      {!loading && tickets.length === 0 && (
        <p style={{ color: fg(0.55), fontStyle: "italic", fontSize: "0.88rem" }}>Noch keine Tickets generiert.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {tickets.map(t => {
          const qrValue = `${window.location.origin}${BASE}/boomer-orga-intern/ticket/${t.ticket_code}`;
          const numDisplay = (() => {
            const n = parseInt(t.ticket_nummer, 10);
            return isNaN(n) ? t.ticket_nummer : String(n).padStart(3, "0");
          })();

          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: "0.85rem",
              background: t.eingelassen_am ? "rgba(46,204,113,0.05)" : am(0.04),
              border: `1px solid ${t.eingelassen_am ? "rgba(46,204,113,0.2)" : am(0.18)}`,
              borderRadius: "5px", padding: "0.6rem 0.85rem",
              flexWrap: "wrap",
            }}>

              {/* Nummer */}
              <div style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "1.05rem", color: A, minWidth: "3rem", flexShrink: 0,
              }}>
                #{numDisplay}
              </div>

              {/* QR-Code */}
              <div style={{ flexShrink: 0, background: "#fff", borderRadius: "3px", padding: "3px" }}>
                <QRCodeSVG value={qrValue} size={52} level="M" />
              </div>

              {/* Name + Code */}
              <div style={{ flex: 1, minWidth: "120px" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "0.92rem", color: FG, marginBottom: "0.2rem" }}>
                  {t.person_name}
                </div>
                <code style={{ fontFamily: "monospace", fontSize: "0.7rem", color: fg(0.5), letterSpacing: "0.05em" }}>
                  {t.ticket_code}
                </code>
              </div>

              {/* Status */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", color: t.versendet_am ? "#2ecc71" : fg(0.4), whiteSpace: "nowrap" }}>
                  {t.versendet_am ? `✉ ${dateFmt(t.versendet_am)}` : "– nicht versendet"}
                </span>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", color: t.eingelassen_am ? "#2ecc71" : fg(0.4), whiteSpace: "nowrap" }}>
                  {t.eingelassen_am
                    ? `✓ ${new Date(t.eingelassen_am).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`
                    : "– noch nicht da"}
                </span>
              </div>

              {/* Download */}
              <a
                href={`${BASE}/api/ticket/${t.ticket_code}/download/pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "'Lora', serif", fontSize: "0.78rem",
                  color: am(0.75), textDecoration: "none",
                  border: `1px solid ${am(0.3)}`, borderRadius: "3px",
                  padding: "0.25rem 0.6rem", flexShrink: 0, whiteSpace: "nowrap",
                }}
              >
                PDF ↓
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
