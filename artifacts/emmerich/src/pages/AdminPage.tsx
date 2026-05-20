import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const SECRET = "emmerich-orga-stats-2026";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_PW = "#Boomer2026";
const PW_KEY = "emmerich_admin_auth";

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PW) { sessionStorage.setItem(PW_KEY, "1"); onAuth(); }
    else { setError(true); setInput(""); }
  };
  return (
    <div style={{ minHeight: "100svh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "320px" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.2rem", color: "#e8991a", textAlign: "center", marginBottom: "0.5rem" }}>Orga-Bereich</p>
        <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }} placeholder="Passwort" autoFocus
          style={{ background: "rgba(245,232,200,0.07)", border: `1px solid ${error ? "#e8991a" : "rgba(245,232,200,0.2)"}`, borderRadius: "3px", color: "#f5e8c8", padding: "0.75rem 1rem", fontSize: "1rem", fontFamily: "'Lora', serif", outline: "none" }} />
        {error && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: "#e8991a", textAlign: "center", margin: 0 }}>Falsches Passwort.</p>}
        <button type="submit" style={{ background: "transparent", border: "1px solid #e8991a", borderRadius: "3px", color: "#e8991a", padding: "0.75rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1rem", cursor: "pointer" }}>Einloggen</button>
      </form>
    </div>
  );
}

interface Registration {
  id: number; name: string; personen: string;
  song: string | null; statement: string | null;
  createdAt: string; visitorId: string | null;
  visitCount: number | null; lastSeen: string | null;
}
interface Visit {
  id: number; when: string; lastSeen: string | null;
  duration: number; device: string; referrer: string;
  visitorId: string; knownName: string | null;
  lang: string | null; timezone: string | null;
  utmSource: string | null; utmMedium: string | null;
  utmCampaign: string | null; entryPath: string | null;
  browser: string | null; os: string | null;
  scrollDepth: number | null; exitPath: string | null;
  visitNumber: number | null;
}
interface ReturnerName { name: string; visitCount: number; lastSeen: string | null; }
interface DayEntry { date: string; visits: number; registrations: number; }
interface HourEntry { hour: number; count: number; }
interface WeekdayEntry { day: string; count: number; }
interface RegTimelineEntry { name: string; date: string; song: string | null; }

interface Stats {
  summary: {
    totalSessions: number; todaySessions: number; weekSessions: number;
    uniqueVisitors: number; returnVisitors: number;
    avgDurationSec: number; todayAvgDurationSec: number; totalAnmeldungen: number;
    bounceRate: number; conversionRate: number; avgScrollDepth: number | null;
  };
  registrations: Registration[];
  returnerNames: ReturnerName[];
  dailyVisits: DayEntry[];
  hourlyDistribution: HourEntry[];
  weekdayDistribution: WeekdayEntry[];
  registrationTimeline: RegTimelineEntry[];
  referrers: [string, number][];
  devices: Record<string, number>;
  todayReferrers: [string, number][];
  utmSources: [string, number][];
  languages: [string, number][];
  screens: [string, number][];
  browsers: [string, number][];
  oses: [string, number][];
  connectionTypes: [string, number][];
  colorSchemes: [string, number][];
  touchDevices: [string, number][];
  recent: Visit[];
}

const A  = "#e8991a";
const FG = "#f5e8c8";
const BG = "#0a0704";
const fg = (o: number) => `rgba(245,232,200,${o})`;
const am = (o: number) => `rgba(232,153,26,${o})`;

function fmt(sec: number) { return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`; }
function when(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function dateFmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function shortDate(isoDate: string) {
  const [, m, d] = isoDate.split("-");
  return `${d}.${m}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.15rem", color: A, marginBottom: "1rem", marginTop: "2.5rem", borderBottom: `1px solid ${am(0.25)}`, paddingBottom: "0.4rem" }}>
      {children}
    </h2>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.82rem", color: fg(0.7), marginBottom: "0.7rem", textTransform: "uppercase" as const, letterSpacing: "0.1em", fontFamily: "'Lora', serif" }}>
      {children}
    </p>
  );
}

function StatCard({ n, label, sub }: { n: string | number; label: string; sub?: string }) {
  return (
    <div style={{ background: am(0.06), border: `1px solid ${am(0.25)}`, borderRadius: "6px", padding: "1rem 1.2rem" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem", color: A, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: "0.82rem", color: fg(0.7), marginTop: "0.35rem", fontFamily: "'Lora', serif" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.78rem", color: fg(0.5), marginTop: "0.2rem", fontFamily: "'Lora', serif", fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.6rem" }}>
      <div style={{ width: "120px", flexShrink: 0, fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.85), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label || "—"}</div>
      <div style={{ flex: 1, height: "9px", background: am(0.15), borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: A, borderRadius: "4px" }} />
      </div>
      <div style={{ width: "30px", textAlign: "right", fontFamily: "'Lora', serif", fontSize: "0.88rem", color: A, flexShrink: 0 }}>{count}</div>
    </div>
  );
}

function BarChart({ rows }: { rows: [string, number][] }) {
  if (rows.length === 0) return <p style={{ color: fg(0.55), fontSize: "0.88rem", fontFamily: "'Lora', serif" }}>Noch keine Daten</p>;
  const max = rows[0][1];
  return <div>{rows.map(([k, n]) => <BarRow key={k} label={k} count={n} max={max} />)}</div>;
}

function RegCard({ r }: { r: Registration }) {
  const personenLabel = r.personen === "Nur ich" ? "1 Person" : r.personen;
  return (
    <div style={{ background: am(0.05), border: `1px solid ${am(0.22)}`, borderRadius: "6px", padding: "1.1rem 1.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem", color: A }}>{r.name}</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.85rem", color: fg(0.65), whiteSpace: "nowrap" }}>{dateFmt(r.createdAt)}</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: r.statement || r.song ? "0.6rem" : 0 }}>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.75) }}>{personenLabel}</span>
        {r.visitCount !== null && (
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.65) }}>
            {r.visitCount} Besuch{r.visitCount !== 1 ? "e" : ""} · zuletzt {when(r.lastSeen)}
          </span>
        )}
      </div>
      {r.song && <div style={{ fontFamily: "'Lora', serif", fontSize: "0.92rem", color: fg(0.9), marginBottom: "0.4rem" }}><span style={{ color: A }}>♪</span> {r.song}</div>}
      {r.statement && (
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fg(0.72), lineHeight: 1.65, borderLeft: `2px solid ${am(0.3)}`, paddingLeft: "0.7rem", marginTop: "0.5rem" }}>
          {r.statement}
        </div>
      )}
    </div>
  );
}

function DailyChart({ data }: { data: DayEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  const maxVisits = Math.max(...data.map(d => d.visits), 1);
  const chartH = 100;
  const colW = 22;

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", minWidth: `${data.length * (colW + 2)}px`, position: "relative" }}>
        {data.map((d, i) => {
          const barH = Math.max(d.visits > 0 ? Math.round((d.visits / maxVisits) * chartH) : 0, d.visits > 0 ? 3 : 0);
          const isMonday = new Date(d.date).getDay() === 1;
          const showLabel = i === 0 || i === data.length - 1 || isMonday;
          return (
            <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${colW}px`, flexShrink: 0, position: "relative" }}>
              {d.registrations > 0 && (
                <div title={`${d.registrations} Anmeldung${d.registrations > 1 ? "en" : ""}`}
                  style={{ position: "absolute", bottom: `${barH + 22}px`, width: "8px", height: "8px", borderRadius: "50%", background: FG, border: `2px solid ${A}`, zIndex: 1 }} />
              )}
              <div
                style={{ width: `${colW - 4}px`, height: `${barH}px`, background: d.visits > 0 ? A : am(0.14), borderRadius: "2px 2px 0 0", marginBottom: "2px", cursor: "default" }}
                title={`${d.date}: ${d.visits} Besuche${d.registrations > 0 ? `, ${d.registrations} Anmeldung(en)` : ""}`}
              />
              {showLabel && (
                <div style={{ fontSize: "0.72rem", color: fg(0.65), whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "top right", marginTop: "4px", marginRight: "4px", fontFamily: "'Lora', serif" }}>
                  {shortDate(d.date)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "1.4rem", marginTop: "2rem", fontFamily: "'Lora', serif", fontSize: "0.85rem", color: fg(0.7) }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <div style={{ width: "12px", height: "12px", background: A, borderRadius: "2px" }} /> Besuche
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: FG, border: `2px solid ${A}` }} /> Anmeldung
        </div>
      </div>
    </div>
  );
}

function HourlyChart({ data }: { data: HourEntry[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartH = 72;
  const peakHour = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "1px" }}>
        {data.map(d => {
          const barH = Math.max(d.count > 0 ? Math.round((d.count / maxCount) * chartH) : 0, d.count > 0 ? 3 : 0);
          const isPeak = d.count > 0 && d.hour === peakHour.hour;
          return (
            <div key={d.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div
                style={{ width: "100%", height: `${barH}px`, background: isPeak ? FG : A, opacity: d.count === 0 ? 0.18 : 1, borderRadius: "1px 1px 0 0" }}
                title={`${d.hour}:00 Uhr — ${d.count} Besuche`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.7) }}>
        {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}h</span>)}
      </div>
      {peakHour.count > 0 && (
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fg(0.65), marginTop: "0.6rem" }}>
          Spitze: <span style={{ color: FG, fontWeight: 600 }}>{peakHour.hour}:00–{peakHour.hour + 1}:00 Uhr</span> ({peakHour.count} Besuche)
        </p>
      )}
    </div>
  );
}

function WeekdayChart({ data }: { data: WeekdayEntry[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartH = 72;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px" }}>
        {data.map(d => {
          const barH = Math.max(d.count > 0 ? Math.round((d.count / maxCount) * chartH) : 0, d.count > 0 ? 3 : 0);
          return (
            <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div
                style={{ width: "100%", height: `${barH}px`, background: A, opacity: d.count === 0 ? 0.15 : 1, borderRadius: "2px 2px 0 0" }}
                title={`${d.day}: ${d.count} Besuche`}
              />
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.75), marginTop: "6px" }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegTimeline({ data }: { data: RegTimelineEntry[] }) {
  if (data.length === 0) return <p style={{ color: fg(0.55), fontSize: "0.88rem", fontFamily: "'Lora', serif" }}>Noch keine Anmeldungen.</p>;

  return (
    <div style={{ padding: "1.5rem 0 1rem", position: "relative" }}>
      <div style={{ position: "relative", height: `${data.length * 58 + 20}px` }}>
        <div style={{ position: "absolute", left: "74px", top: "10px", bottom: "10px", borderLeft: `2px solid ${am(0.35)}` }} />

        {data.map((r, i) => {
          const top = 10 + i * 58;
          return (
            <div key={`${r.name}-${i}`} style={{ position: "absolute", top: `${top}px`, left: 0, right: 0, display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div style={{ width: "70px", flexShrink: 0, textAlign: "right", fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.7), lineHeight: 1.35, paddingTop: "2px" }}>
                {dateFmt(r.date)}
              </div>
              <div style={{ position: "relative", flexShrink: 0, width: "14px", height: "14px", marginTop: "2px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: A, border: `2px solid ${BG}`, boxShadow: `0 0 0 1.5px ${A}` }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: A, lineHeight: 1.25 }}>{r.name}</div>
                {r.song && <div style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.72), marginTop: "0.2rem" }}>♪ {r.song}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TicketRow {
  id: number;
  anmeldungId: number | null;
  personName: string;
  ticketCode: string;
  paymentMethod: string | null;
  paidAt: string | null;
  usedAt: string | null;
  createdAt: string;
  registrationName: string | null;
}

interface AnmeldungTicketInfo {
  ticket_nummer: string;
  ticket_code: string;
  person_name: string;
}

interface AnmeldungRow {
  id: number;
  email: string;
  telefon: string | null;
  personen_anzahl: number;
  personen: string[];
  bezahlweg: string;
  song: string | null;
  statement: string | null;
  betrag_gesamt: number;
  bezahlt_am: string | null;
  ticket_versendet_am: string | null;
  created_at: string;
  ticket_count: number;
  tickets: AnmeldungTicketInfo[];
}

const BW_LABEL: Record<string, string> = { ueberweisung: "Überw.", paypal: "PayPal" };

// ── Anmeldungen-Tabelle ─────────────────────────────────────────────────────

function AnmeldungTableRow({ row, onRefresh }: { row: AnmeldungRow; onRefresh: () => void }) {
  const [bzLoading, setBzLoading] = useState(false);
  const [tkLoading, setTkLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<"png" | "pdf" | null>(null);
  const [msg, setMsg] = useState("");
  const [previewMsg, setPreviewMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const closePreview = useCallback(() => {
    setPreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!previewUrl) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closePreview(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewUrl, closePreview]);

  const markBezahlt = async () => {
    setBzLoading(true); setMsg("");
    try {
      const r = await fetch(`${BASE}/api/admin/anmeldungen/${row.id}/bezahlt`, {
        method: "POST", headers: { "x-admin-secret": SECRET },
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (d.ok) { onRefresh(); } else { setMsg(d.error ?? "Fehler"); }
    } catch { setMsg("Verbindungsfehler"); }
    finally { setBzLoading(false); }
  };

  const sendeTickets = async () => {
    setTkLoading(true); setMsg("");
    try {
      const r = await fetch(`${BASE}/api/admin/anmeldungen/${row.id}/tickets-versenden`, {
        method: "POST", headers: { "x-admin-secret": SECRET },
      });
      const d = await r.json() as { ok?: boolean; tickets_count?: number; error?: string };
      if (d.ok) { setMsg(`${d.tickets_count ?? 0}×✓`); onRefresh(); }
      else { setMsg(d.error ?? "Fehler"); }
    } catch { setMsg("Verbindungsfehler"); }
    finally { setTkLoading(false); }
  };

  const openVorschau = async (format: "png" | "pdf") => {
    setPreviewLoading(format); setPreviewMsg("");
    try {
      const r = await fetch(`${BASE}/api/admin/anmeldungen/${row.id}/ticket-vorschau?format=${format}`, {
        headers: { "x-admin-secret": SECRET },
      });
      if (!r.ok) { setPreviewMsg("Vorschau fehlgeschlagen"); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      if (format === "png") {
        setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `ticket-vorschau-${row.id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }
    } catch { setPreviewMsg("Verbindungsfehler"); }
    finally { setPreviewLoading(null); }
  };

  const personen = Array.isArray(row.personen) ? row.personen : [];
  const bezahlt = !!row.bezahlt_am;
  const versendet = !!row.ticket_versendet_am;

  const tdStyle: React.CSSProperties = {
    padding: "0.55rem 0.6rem",
    fontFamily: "'Lora', serif",
    fontSize: "0.82rem",
    color: FG,
    verticalAlign: "top",
    borderBottom: `1px solid ${am(0.12)}`,
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "'Lora', serif",
    fontSize: "0.78rem",
    border: "none",
    borderRadius: "3px",
    padding: "0.25rem 0.55rem",
    cursor: "pointer",
    display: "block",
    whiteSpace: "nowrap",
  };

  const modal = previewUrl
    ? createPortal(
        <div
          onClick={closePreview}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,7,4,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "relative", maxWidth: "min(700px, 95vw)", maxHeight: "90svh", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
          >
            <button
              onClick={closePreview}
              style={{
                position: "absolute", top: "-2rem", right: 0,
                background: "transparent", border: "none",
                color: "#f5e8c8", fontSize: "1.3rem", cursor: "pointer",
                fontFamily: "'Lora', serif", lineHeight: 1, padding: "0 0.25rem",
              }}
              aria-label="Schließen"
            >✕</button>
            <img
              src={previewUrl}
              alt={`Ticket-Vorschau #${row.id}`}
              style={{ maxWidth: "100%", maxHeight: "80svh", borderRadius: "4px", boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
            />
            <a
              href={previewUrl}
              download={`ticket-vorschau-${row.id}.png`}
              style={{
                background: "transparent", border: `1px solid ${am(0.55)}`,
                borderRadius: "3px", color: am(0.9),
                fontFamily: "'Lora', serif", fontSize: "0.85rem",
                padding: "0.4rem 1.1rem", textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Herunterladen
            </a>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", color: "rgba(245,232,200,0.45)", margin: 0 }}>
              ESC oder Klick außen zum Schließen
            </p>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
    {modal}
    <tr style={{ background: bezahlt ? "rgba(46,204,113,0.04)" : "transparent" }}>
      {/* # */}
      <td style={{ ...tdStyle, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: A, width: "2.5rem" }}>
        {String(row.id).padStart(3, "0")}
      </td>

      {/* E-Mail + Namen */}
      <td style={{ ...tdStyle, minWidth: "160px" }}>
        <div style={{ color: FG, marginBottom: "0.2rem" }}>{row.email}</div>
        {row.telefon && (
          <div style={{ color: fg(0.6), fontSize: "0.78rem", marginBottom: "0.15rem" }}>📞 {row.telefon}</div>
        )}
        <div style={{ color: fg(0.65), fontSize: "0.78rem" }}>{personen.join(", ")}</div>
        {row.song && <div style={{ color: fg(0.5), fontSize: "0.75rem", marginTop: "0.15rem" }}>♪ {row.song}</div>}
      </td>

      {/* Personen */}
      <td style={{ ...tdStyle, textAlign: "center", width: "2.5rem" }}>{row.personen_anzahl}</td>

      {/* Betrag */}
      <td style={{ ...tdStyle, textAlign: "right", width: "3.5rem" }}>{row.betrag_gesamt} €</td>

      {/* Bezahlweg */}
      <td style={{ ...tdStyle, width: "5rem" }}>{BW_LABEL[row.bezahlweg] ?? row.bezahlweg}</td>

      {/* Angemeldet */}
      <td style={{ ...tdStyle, color: fg(0.55), width: "5.5rem", fontSize: "0.78rem" }}>{dateFmt(row.created_at)}</td>

      {/* Bezahlt-Spalte */}
      <td style={{ ...tdStyle, width: "8rem" }}>
        {bezahlt ? (
          <span style={{ color: "#2ecc71", fontSize: "0.78rem" }}>✓ {dateFmt(row.bezahlt_am!)}</span>
        ) : (
          <button onClick={markBezahlt} disabled={bzLoading} style={{
            ...btnBase,
            background: am(0.15),
            color: A,
          }}>
            {bzLoading ? "…" : "Als bezahlt"}
          </button>
        )}
        {msg && !versendet && <div style={{ color: "#e74c3c", fontSize: "0.73rem", marginTop: "0.2rem" }}>{msg}</div>}
      </td>

      {/* Tickets-Spalte */}
      <td style={{ ...tdStyle, width: "10rem" }}>
        {versendet ? (
          <>
            <span style={{ color: "#2ecc71", fontSize: "0.78rem", display: "block" }}>
              ✉ {dateFmt(row.ticket_versendet_am!)} ({Number(row.ticket_count)}×)
            </span>
            <button onClick={sendeTickets} disabled={tkLoading} style={{
              ...btnBase,
              background: "transparent",
              border: `1px solid ${am(0.3)}`,
              color: fg(0.55),
              marginTop: "0.3rem",
              fontSize: "0.73rem",
            }}>
              {tkLoading ? "…" : "Nochmal senden"}
            </button>
          </>
        ) : (
          <button onClick={sendeTickets} disabled={tkLoading || !bezahlt} style={{
            ...btnBase,
            background: bezahlt ? A : am(0.08),
            color: bezahlt ? BG : fg(0.35),
            fontWeight: bezahlt ? 600 : 400,
            cursor: bezahlt ? "pointer" : "not-allowed",
          }}>
            {tkLoading ? "Wird versendet …" : `Tickets versenden (${row.personen_anzahl})`}
          </button>
        )}
        {msg && versendet && <div style={{ color: "#2ecc71", fontSize: "0.73rem", marginTop: "0.2rem" }}>{msg}</div>}
        <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
          <button onClick={() => openVorschau("png")} disabled={previewLoading !== null} style={{
            ...btnBase,
            background: "transparent",
            border: `1px solid ${am(0.28)}`,
            color: previewLoading === "png" ? fg(0.35) : fg(0.6),
            fontSize: "0.71rem",
          }}>
            {previewLoading === "png" ? "…" : "Vorschau"}
          </button>
          <button onClick={() => openVorschau("pdf")} disabled={previewLoading !== null} style={{
            ...btnBase,
            background: "transparent",
            border: `1px solid ${am(0.28)}`,
            color: previewLoading === "pdf" ? fg(0.35) : fg(0.6),
            fontSize: "0.71rem",
          }}>
            {previewLoading === "pdf" ? "…" : "PDF ↓"}
          </button>
        </div>
        {previewMsg && <div style={{ color: "#e74c3c", fontSize: "0.73rem", marginTop: "0.2rem" }}>{previewMsg}</div>}
        {row.tickets.length > 0 && (
          <div style={{ marginTop: "0.5rem", borderTop: `1px solid ${am(0.15)}`, paddingTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {row.tickets.map(t => (
              <div key={t.ticket_nummer} style={{ display: "flex", gap: "0.4rem", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "0.72rem", color: fg(0.5), flexShrink: 0 }}>{t.ticket_nummer}</span>
                <code style={{ fontSize: "0.7rem", color: fg(0.75), background: am(0.06), borderRadius: "2px", padding: "0 0.25rem", letterSpacing: "0.04em", fontFamily: "monospace" }}>{t.ticket_code}</code>
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
    </>
  );
}

const PAY_LABELS: Record<string, string> = { paypal: "PayPal", ueberweisung: "Überweisung", bar: "Bar" };
const PAY_OPTIONS = [
  { value: "paypal",       label: "PayPal" },
  { value: "ueberweisung", label: "Überweisung" },
  { value: "bar",          label: "Bar" },
];

function parsePersonenCount(personen: string): number {
  if (personen === "Nur ich") return 1;
  const m = personen.match(/(\d+)/);
  return m ? parseInt(m[1]) : 1;
}

function defaultNames(baseName: string, count: number): string[] {
  if (count === 1) return [baseName];
  return Array.from({ length: count }, (_, i) => i === 0 ? baseName : "");
}

function InteressentArchivCard({ reg }: { reg: Registration }) {
  return (
    <div style={{ border: `1px solid ${am(0.2)}`, borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "0.5rem", background: am(0.04) }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", flexWrap: "wrap", marginBottom: reg.statement || reg.song ? "0.45rem" : 0 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.97rem", color: A }}>{reg.name}</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.55) }}>{reg.personen}</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.75rem", color: fg(0.4), marginLeft: "auto" }}>{dateFmt(reg.createdAt)}</span>
      </div>
      {reg.statement && (
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: fg(0.65), marginBottom: reg.song ? "0.25rem" : 0 }}>
          „{reg.statement}"
        </div>
      )}
      {reg.song && (
        <div style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", color: fg(0.45) }}>♪ {reg.song}</div>
      )}
    </div>
  );
}

function TicketManager({ reg, tickets, onRefresh }: {
  reg: Registration;
  tickets: TicketRow[];
  onRefresh: () => void;
}) {
  const myTickets = tickets.filter(t => t.anmeldungId === reg.id);
  const personCount = parsePersonenCount(reg.personen);
  const isGroup = personCount > 1;

  // For groups: collect extra names before generating
  const [groupNames, setGroupNames] = useState<string[]>(() =>
    Array.from({ length: personCount }, (_, i) => i === 0 ? reg.name : "")
  );
  const [groupPay, setGroupPay] = useState("bar");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenNames, setRegenNames] = useState<string[]>([]);
  const [regenPay, setRegenPay] = useState("bar");
  const [copied, setCopied] = useState<number | null>(null);

  const generate = async (payMethod: string, names: string[]) => {
    setLoading(true); setMsg("");
    try {
      const r = await fetch(`${BASE}/api/admin/tickets/generate`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-secret": SECRET },
        body: JSON.stringify({ anmeldungId: reg.id, paymentMethod: payMethod, names }),
      });
      const data = await r.json();
      if (data.success) { setRegenOpen(false); onRefresh(); }
      else { setMsg(`Fehler: ${data.error ?? "Unbekannt"}`); }
    } catch { setMsg("Verbindungsfehler."); }
    finally { setLoading(false); }
  };

  const copyLink = (code: string, id: number) => {
    const url = `${window.location.origin}${BASE}/boomer-orga-intern/ticket/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const ticketBase = `${window.location.origin}${BASE}/boomer-orga-intern/ticket/`;
  const groupNamesValid = groupNames.every(n => n.trim().length > 0);

  return (
    <div style={{ border: `1px solid ${am(0.25)}`, borderRadius: "6px", overflow: "hidden", marginBottom: "0.6rem" }}>

      {/* Header */}
      <div style={{ padding: "0.75rem 1rem", background: am(0.06), display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: A }}>{reg.name}</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.6) }}>{reg.personen}</span>
        {myTickets.length > 0 && (
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", color: "#2ecc71", background: "rgba(46,204,113,0.12)", padding: "0.15rem 0.5rem", borderRadius: "20px" }}>
            {myTickets.length} Ticket{myTickets.length > 1 ? "s" : ""} · {PAY_LABELS[myTickets[0].paymentMethod ?? ""] ?? "—"}
          </span>
        )}
      </div>

      {/* No tickets yet */}
      {myTickets.length === 0 && (
        <div style={{ padding: "0.85rem 1rem", borderTop: `1px solid ${am(0.12)}` }}>

          {/* SINGLE person: one-click per payment method */}
          {!isGroup && (
            <>
              <p style={{ fontSize: "0.78rem", color: fg(0.55), fontFamily: "'Lora', serif", margin: "0 0 0.55rem", letterSpacing: "0.06em" }}>
                Zahlung eingegangen per:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {PAY_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => generate(o.value, [reg.name])} disabled={loading}
                    style={{ background: A, border: "none", borderRadius: "4px", color: BG, padding: "0.5rem 1.1rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1 }}>
                    {loading ? "…" : o.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* GROUP: collect names first, then generate */}
          {isGroup && (
            <>
              <p style={{ fontSize: "0.78rem", color: fg(0.55), fontFamily: "'Lora', serif", margin: "0 0 0.6rem", letterSpacing: "0.06em" }}>
                Namen aller {personCount} Personen (für personifizierte Tickets):
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.8rem" }}>
                {groupNames.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.5), width: "1.2rem", flexShrink: 0, textAlign: "right" }}>{i + 1}.</span>
                    <input
                      value={n}
                      onChange={e => setGroupNames(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={i === 0 ? reg.name : `Name Person ${i + 1}`}
                      style={{ flex: 1, background: "rgba(245,232,200,0.06)", border: `1px solid ${n.trim() ? am(0.3) : "rgba(231,76,60,0.5)"}`, borderRadius: "3px", color: FG, padding: "0.4rem 0.6rem", fontSize: "0.88rem", fontFamily: "'Lora', serif", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <p style={{ fontSize: "0.78rem", color: fg(0.55), fontFamily: "'Lora', serif", margin: "0 0 0.4rem", letterSpacing: "0.06em" }}>Zahlungsart:</p>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {PAY_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setGroupPay(o.value)}
                      style={{ background: groupPay === o.value ? A : "transparent", border: `1px solid ${A}`, borderRadius: "3px", color: groupPay === o.value ? BG : A, padding: "0.35rem 0.8rem", fontFamily: "'Lora', serif", fontSize: "0.88rem", cursor: "pointer" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => generate(groupPay, groupNames.map(n => n.trim()))}
                disabled={loading || !groupNamesValid}
                style={{ background: groupNamesValid ? A : am(0.35), border: "none", borderRadius: "4px", color: BG, padding: "0.5rem 1.3rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.95rem", fontWeight: 700, cursor: (loading || !groupNamesValid) ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Generiere…" : !groupNamesValid ? "Bitte alle Namen ausfüllen" : "Tickets generieren"}
              </button>
            </>
          )}

          {msg && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "#e74c3c", marginTop: "0.5rem" }}>{msg}</p>}
        </div>
      )}

      {/* Tickets exist: show list with copy-link */}
      {myTickets.length > 0 && (
        <div style={{ padding: "0.75rem 1rem" }}>
          {myTickets.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.85), minWidth: "120px" }}>{t.personName}</span>
              <code style={{ fontFamily: "monospace", fontSize: "0.78rem", color: A, letterSpacing: "0.08em" }}>{t.ticketCode}</code>
              {t.usedAt
                ? <span style={{ fontSize: "0.75rem", color: "#e8991a", fontFamily: "'Lora', serif" }}>✓ Eingelöst {new Date(t.usedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</span>
                : <span style={{ fontSize: "0.75rem", color: "#2ecc71", fontFamily: "'Lora', serif" }}>Nicht eingelöst</span>
              }
              <a href={`${ticketBase}${t.ticketCode}`} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.75rem", color: A, fontFamily: "'Lora', serif", fontStyle: "italic", textDecoration: "underline" }}>
                Öffnen / Drucken
              </a>
              <button onClick={() => copyLink(t.ticketCode, t.id)}
                style={{ fontSize: "0.72rem", background: "transparent", border: `1px solid ${am(0.35)}`, borderRadius: "3px", color: copied === t.id ? "#2ecc71" : fg(0.55), padding: "0.15rem 0.5rem", fontFamily: "'Lora', serif", cursor: "pointer" }}>
                {copied === t.id ? "✓ Kopiert" : "Link kopieren"}
              </button>
            </div>
          ))}

          {/* Re-generate (collapsible) */}
          <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${am(0.12)}`, paddingTop: "0.6rem" }}>
            <button onClick={() => {
              setRegenOpen(o => !o);
              setRegenNames(myTickets.map(t => t.personName));
              setRegenPay(myTickets[0]?.paymentMethod ?? "bar");
            }}
              style={{ background: "transparent", border: `1px solid ${am(0.3)}`, borderRadius: "3px", color: fg(0.5), padding: "0.28rem 0.75rem", fontFamily: "'Lora', serif", fontSize: "0.78rem", cursor: "pointer" }}>
              {regenOpen ? "▲ Abbrechen" : "Tickets neu generieren …"}
            </button>

            {regenOpen && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: fg(0.55), fontFamily: "'Lora', serif", margin: "0 0 0.35rem" }}>Namen</p>
                  {regenNames.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: fg(0.5), width: "1.2rem", flexShrink: 0 }}>{i + 1}.</span>
                      <input value={n} onChange={e => setRegenNames(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                        style={{ flex: 1, background: "rgba(245,232,200,0.06)", border: `1px solid ${am(0.3)}`, borderRadius: "3px", color: FG, padding: "0.4rem 0.6rem", fontSize: "0.88rem", fontFamily: "'Lora', serif", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: fg(0.55), fontFamily: "'Lora', serif", margin: "0 0 0.35rem" }}>Zahlungsart</p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {PAY_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setRegenPay(o.value)}
                        style={{ background: regenPay === o.value ? A : "transparent", border: `1px solid ${A}`, borderRadius: "3px", color: regenPay === o.value ? BG : A, padding: "0.3rem 0.7rem", fontFamily: "'Lora', serif", fontSize: "0.85rem", cursor: "pointer" }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => generate(regenPay, regenNames.map(n => n.trim() || "—"))} disabled={loading}
                  style={{ alignSelf: "flex-start", background: A, border: "none", borderRadius: "4px", color: BG, padding: "0.5rem 1.2rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Generiere…" : "Neu generieren"}
                </button>
                {msg && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: "#e74c3c" }}>{msg}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScrollBar({ depth }: { depth: number | null }) {
  if (depth == null) return <span style={{ color: fg(0.4), fontStyle: "italic" }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <div style={{ width: "48px", height: "6px", background: am(0.2), borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${depth}%`, height: "100%", background: A, borderRadius: "3px" }} />
      </div>
      <span style={{ color: fg(0.8), fontSize: "0.82rem" }}>{depth}%</span>
    </div>
  );
}

function visitOrdinal(n: number | null): string {
  if (n == null) return "—";
  return `${n}.`;
}

type Tab = "anmeldungen" | "tickets" | "statistik";

const TABS: { id: Tab; label: string }[] = [
  { id: "anmeldungen", label: "Interessenten" },
  { id: "tickets",     label: "Tickets" },
  { id: "statistik",   label: "Statistik" },
];

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${am(0.25)}`, marginBottom: "2rem" }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          background: "transparent", border: "none", borderBottom: active === t.id ? `2px solid ${A}` : "2px solid transparent",
          color: active === t.id ? A : fg(0.55), cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          fontSize: "1rem", padding: "0.55rem 1.1rem 0.5rem", marginBottom: "-1px",
          transition: "color 0.15s",
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(PW_KEY) === "1");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [ticketRows, setTicketRows] = useState<TicketRow[]>([]);
  const [anmeldungenRows, setAnmeldungenRows] = useState<AnmeldungRow[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("anmeldungen");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [kaiState, setKaiState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const [kaiComment, setKaiComment] = useState<string | null>(null);

  const regenerateKai = async () => {
    setKaiState("loading");
    setKaiComment(null);
    try {
      const r = await fetch(`${BASE}/api/stimmung/regenerate`, {
        method: "POST",
        headers: { "x-admin-secret": SECRET, "Content-Type": "application/json" },
      });
      const d = await r.json();
      if (d.ok) {
        setKaiState("done");
        setKaiComment(d.inhalt ?? null);
      } else {
        setKaiState("error");
      }
    } catch {
      setKaiState("error");
    }
    setTimeout(() => setKaiState(s => s === "done" ? "idle" : s), 15000);
  };

  const load = () => {
    fetch(`${BASE}/api/admin-stats?key=${SECRET}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setStats(d); setLastLoaded(new Date()); } })
      .catch(() => setError("Verbindungsfehler"));
  };

  const loadTickets = useCallback(() => {
    fetch(`${BASE}/api/admin/tickets`, { headers: { "x-admin-secret": SECRET } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTicketRows(data); })
      .catch(() => {});
  }, []);

  const loadAnmeldungen = useCallback(() => {
    fetch(`${BASE}/api/admin/anmeldungen`, { headers: { "x-admin-secret": SECRET } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAnmeldungenRows(data); })
      .catch(() => {});
  }, []);

  const refreshAll = useCallback(() => { load(); loadTickets(); loadAnmeldungen(); }, [loadTickets, loadAnmeldungen]);

  useEffect(() => { if (authed) refreshAll(); }, [authed]);

  useEffect(() => {
    if (!authed || !autoRefresh) return;
    const id = setInterval(() => refreshAll(), 30_000);
    return () => clearInterval(id);
  }, [authed, autoRefresh, refreshAll]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  if (error) return <div style={{ background: BG, color: FG, minHeight: "100svh", padding: "3rem 1.5rem", fontFamily: "'Lora', serif" }}><p style={{ color: A, marginTop: "4rem" }}>⚠ {error}</p></div>;
  if (!stats) return <div style={{ background: BG, color: FG, minHeight: "100svh", padding: "3rem 1.5rem", fontFamily: "'Lora', serif" }}><p style={{ color: fg(0.55), marginTop: "4rem" }}>Lädt …</p></div>;

  const { summary, registrations, returnerNames, dailyVisits, hourlyDistribution, weekdayDistribution, registrationTimeline, referrers, devices, todayReferrers, utmSources, languages, browsers, oses, connectionTypes, colorSchemes, touchDevices, recent } = stats;
  const deviceRows = Object.entries(devices).sort((a, b) => b[1] - a[1]) as [string, number][];

  return (
    <div style={{ background: BG, color: FG, minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem 1.5rem", maxWidth: "820px", margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.4rem,4vw,2rem)", color: A, lineHeight: 1.2 }}>
          Emmerich boomt — Orga
        </h1>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <a href={`${BASE}/boomer-orga-intern/einlass`} style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "3px", color: am(0.85), textDecoration: "none", fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem" }}>
            Einlass-Scanner
          </a>
          <button onClick={refreshAll} style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "3px", color: am(0.85), cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem" }}>
            Aktualisieren
          </button>
          <button onClick={() => setAutoRefresh(v => !v)} title={autoRefresh ? "Auto-Refresh deaktivieren" : "Auto-Refresh aktivieren"}
            style={{ background: autoRefresh ? am(0.15) : "transparent", border: `1px solid ${am(autoRefresh ? 0.6 : 0.3)}`, borderRadius: "3px", color: am(autoRefresh ? 1 : 0.5), cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}>
            ⟳ 30s
          </button>
        </div>
      </div>
      {lastLoaded && <p style={{ fontSize: "0.85rem", color: fg(0.55), marginBottom: "1.5rem", fontFamily: "'Lora', serif" }}>
        Stand: {lastLoaded.toLocaleString("de-DE")}{autoRefresh ? " · Auto-Refresh aktiv" : ""}
      </p>}

      {/* ── Tab-Navigation ── */}
      <TabBar active={activeTab} onSelect={setActiveTab} />

      {/* ── Tab: Interessenten (Phase 1) ── */}
      {activeTab === "anmeldungen" && (
        <>
          <SectionTitle>Interessenten ({registrations.length})</SectionTitle>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: fg(0.6), marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
            Unverbindliche Interessensbekundungen aus Phase 1 — zur Information.
          </p>
          {registrations.length === 0
            ? <p style={{ color: fg(0.55), fontSize: "0.92rem" }}>Noch keine Interessenten.</p>
            : registrations.map(r => (
                <InteressentArchivCard key={r.id} reg={r} />
              ))
          }
        </>
      )}

      {/* ── Tab: Tickets (Phase 2) ── */}
      {activeTab === "tickets" && (
        <>
          {/* Bezahlt-Zusammenfassung */}
          {anmeldungenRows.length > 0 && (() => {
            const bezahlt   = anmeldungenRows.filter(r => r.bezahlt_am).length;
            const versendet = anmeldungenRows.filter(r => r.ticket_versendet_am).length;
            const sumPersonen = anmeldungenRows.reduce((s, r) => s + r.personen_anzahl, 0);
            const sumBetrag   = anmeldungenRows.reduce((s, r) => s + r.betrag_gesamt, 0);
            const sumBezahlt  = anmeldungenRows.filter(r => r.bezahlt_am).reduce((s, r) => s + r.betrag_gesamt, 0);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.7rem", marginBottom: "2rem" }}>
                <StatCard n={anmeldungenRows.length} label="Anmeldungen" />
                <StatCard n={sumPersonen}            label="Personen gesamt" />
                <StatCard n={`${bezahlt} / ${anmeldungenRows.length}`} label="Bezahlt" />
                <StatCard n={`${versendet} / ${anmeldungenRows.length}`} label="Tickets versendet" />
                <StatCard n={`${sumBetrag} €`}       label="Erwartet gesamt" />
                <StatCard n={`${sumBezahlt} €`}      label="Eingegangen" />
              </div>
            );
          })()}

          <SectionTitle>Phase-2-Anmeldungen ({anmeldungenRows.length})</SectionTitle>
          <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: fg(0.55), marginTop: "-0.75rem", marginBottom: "1.25rem" }}>
            Grüne Zeile = bezahlt. Zuerst „Als bezahlt" markieren, dann Tickets versenden.
          </p>
          {anmeldungenRows.length === 0
            ? <p style={{ color: fg(0.55), fontSize: "0.92rem" }}>Noch keine Anmeldungen.</p>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${am(0.3)}` }}>
                      {(["#", "E-Mail / Namen", "Pers.", "Betrag", "Weg", "Angemeldet", "Bezahlt", "Tickets"] as const).map(h => (
                        <th key={h} style={{
                          padding: "0.4rem 0.6rem",
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          color: A,
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {anmeldungenRows.map(r => (
                      <AnmeldungTableRow key={r.id} row={r} onRefresh={loadAnmeldungen} />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}

      {/* ── Tab: Statistik ── */}
      {activeTab === "statistik" && (
        <>
          {/* KaI neu generieren */}
          <div style={{ marginBottom: "1.5rem", background: am(0.06), borderRadius: "6px", border: `1px solid ${am(0.2)}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 1.1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.95rem", color: A, fontWeight: 700 }}>KaI — Kommentar</div>
                <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.78rem", color: fg(0.5), marginTop: "0.2rem" }}>Neuen KaI-Kommentar mit allen aktuellen Anmeldungen generieren</div>
              </div>
              <button onClick={regenerateKai} disabled={kaiState === "loading"} style={{
                background: kaiState === "done" ? "transparent" : kaiState === "error" ? "transparent" : A,
                border: `1px solid ${kaiState === "error" ? "#e05555" : A}`,
                borderRadius: "4px",
                color: kaiState === "done" ? A : kaiState === "error" ? "#e05555" : BG,
                padding: "0.5rem 1.1rem",
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: kaiState === "loading" ? "wait" : "pointer",
                opacity: kaiState === "loading" ? 0.6 : 1,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
                {kaiState === "loading" ? "Generiert …" : kaiState === "done" ? "✓ Erstellt" : kaiState === "error" ? "✗ Fehler" : "KaI neu generieren"}
              </button>
            </div>
            {kaiComment && (
              <div style={{ padding: "0.7rem 1.1rem", borderTop: `1px solid ${am(0.18)}`, background: am(0.04) }}>
                <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.82rem", color: fg(0.75), lineHeight: 1.55 }}>
                  „{kaiComment}"
                </div>
              </div>
            )}
          </div>

          <SectionTitle>Übersicht</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "0.85rem", marginBottom: "0.5rem" }}>
            <StatCard n={summary.totalAnmeldungen}         label="Anmeldungen" />
            <StatCard n={summary.totalSessions}            label="Besuche gesamt" />
            <StatCard n={summary.todaySessions}            label="Besuche heute" />
            <StatCard n={summary.weekSessions}             label="Diese Woche" />
            <StatCard n={summary.uniqueVisitors}           label="Eindeutige Besucher" />
            <StatCard n={summary.returnVisitors}           label="Wiederkommer" />
            <StatCard n={fmt(summary.avgDurationSec)}      label="Ø Verweildauer" />
            <StatCard n={fmt(summary.todayAvgDurationSec)} label="Ø Heute" />
            <StatCard n={`${summary.bounceRate}%`}         label="Absprungrate" sub="Besuche unter 30 s" />
            <StatCard n={`${summary.conversionRate}%`}     label="Konversionsrate" sub="Besucher → Angemeldet" />
            <StatCard
              n={summary.avgScrollDepth != null ? `${summary.avgScrollDepth}%` : "—"}
              label="Ø Scroll-Tiefe"
              sub="Wie weit gescrollt"
            />
          </div>

          <SectionTitle>Besuchsverlauf — letzte 30 Tage</SectionTitle>
          <DailyChart data={dailyVisits} />

          <SectionTitle>Wann kommen Besucher?</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "2.5rem" }}>
            <div>
              <SubLabel>Uhrzeit (MEZ/MESZ)</SubLabel>
              <HourlyChart data={hourlyDistribution} />
            </div>
            <div>
              <SubLabel>Wochentag</SubLabel>
              <WeekdayChart data={weekdayDistribution} />
            </div>
          </div>

          <SectionTitle>Geräte & Herkunft</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem" }}>
            <div><SubLabel>Geräte</SubLabel><BarChart rows={deviceRows} /></div>
            <div><SubLabel>Herkunft gesamt</SubLabel><BarChart rows={referrers} /></div>
            {todayReferrers.length > 0 && <div><SubLabel>Herkunft heute</SubLabel><BarChart rows={todayReferrers} /></div>}
            <div><SubLabel>Sprachen</SubLabel><BarChart rows={languages} /></div>
          </div>

          <SectionTitle>Browser & Betriebssystem</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem" }}>
            <div><SubLabel>Browser</SubLabel><BarChart rows={browsers} /></div>
            <div><SubLabel>Betriebssystem</SubLabel><BarChart rows={oses} /></div>
            {connectionTypes.length > 0 && <div><SubLabel>Verbindungstyp</SubLabel><BarChart rows={connectionTypes} /></div>}
            <div><SubLabel>Farbschema</SubLabel><BarChart rows={colorSchemes} /></div>
            {touchDevices.length > 0 && <div><SubLabel>Touch-Gerät</SubLabel><BarChart rows={touchDevices} /></div>}
          </div>

          {returnerNames.length > 0 && (
            <>
              <SectionTitle>Bekannte Wiederkommer</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {returnerNames.map(r => (
                  <div key={r.name} style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.92rem" }}>
                    <span style={{ color: A, fontWeight: 600, minWidth: "110px" }}>{r.name}</span>
                    <span style={{ color: fg(0.75) }}>{r.visitCount} Besuche</span>
                    <span style={{ color: fg(0.6), fontSize: "0.88rem" }}>zuletzt {when(r.lastSeen)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {utmSources.length > 0 && (
            <>
              <SectionTitle>UTM-Quellen (getrackte Links)</SectionTitle>
              <BarChart rows={utmSources} />
            </>
          )}

          <SectionTitle>Letzte Besuche</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", minWidth: "700px" }}>
              <thead>
                <tr>
                  {["Wann", "Dauer", "Gerät", "Browser", "OS", "Scroll", "Einstieg", "Ausstieg", "Besuch #", "Wer"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.6rem", borderBottom: `1px solid ${am(0.25)}`, color: fg(0.65), fontWeight: 400, fontStyle: "italic", whiteSpace: "nowrap", fontSize: "0.82rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.85), whiteSpace: "nowrap" }}>{when(r.when)}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: A, whiteSpace: "nowrap" }}>{fmt(r.duration)}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.8) }}>{r.device}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.8) }}>{r.browser ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.75) }}>{r.os ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}` }}><ScrollBar depth={r.scrollDepth} /></td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.65), maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.entryPath ?? undefined}>{r.entryPath ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.6), maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.exitPath ?? undefined}>{r.exitPath ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.7), textAlign: "center" }}>{visitOrdinal(r.visitNumber)}</td>
                    <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: r.knownName ? A : fg(0.4), fontStyle: r.knownName ? "normal" : "italic", fontSize: "0.82rem" }}>{r.knownName ?? (r.visitorId ? `${r.visitorId}…` : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
