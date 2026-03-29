import { useEffect, useRef, useState } from "react";

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
          style={{ background: "rgba(245,232,200,0.05)", border: `1px solid ${error ? "#e8991a" : "rgba(245,232,200,0.15)"}`, borderRadius: "3px", color: "#f5e8c8", padding: "0.75rem 1rem", fontSize: "1rem", fontFamily: "'Lora', serif", outline: "none" }} />
        {error && <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.88rem", color: "#e8991a", textAlign: "center", margin: 0 }}>Falsches Passwort.</p>}
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
  recent: Visit[];
}

const A = "#e8991a";
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
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: A, marginBottom: "0.9rem", marginTop: "2.5rem", borderBottom: `1px solid ${am(0.18)}`, paddingBottom: "0.4rem" }}>
      {children}
    </h2>
  );
}

function StatCard({ n, label }: { n: string | number; label: string }) {
  return (
    <div style={{ background: am(0.04), border: `1px solid ${am(0.2)}`, borderRadius: "6px", padding: "1rem 1.2rem" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.9rem", color: A, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: "0.75rem", color: fg(0.5), marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
      <div style={{ width: "110px", flexShrink: 0, fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.75), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label || "—"}</div>
      <div style={{ flex: 1, height: "8px", background: am(0.1), borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: A, borderRadius: "4px" }} />
      </div>
      <div style={{ width: "28px", textAlign: "right", fontFamily: "'Lora', serif", fontSize: "0.82rem", color: A, flexShrink: 0 }}>{count}</div>
    </div>
  );
}

function BarChart({ rows }: { rows: [string, number][] }) {
  if (rows.length === 0) return <p style={{ color: fg(0.3), fontSize: "0.85rem" }}>Noch keine Daten</p>;
  const max = rows[0][1];
  return <div>{rows.map(([k, n]) => <BarRow key={k} label={k} count={n} max={max} />)}</div>;
}

function RegCard({ r }: { r: Registration }) {
  const personenLabel = r.personen === "Nur ich" ? "1 Person" : r.personen;
  return (
    <div style={{ background: am(0.04), border: `1px solid ${am(0.18)}`, borderRadius: "6px", padding: "1.1rem 1.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.05rem", color: A }}>{r.name}</span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.76rem", color: fg(0.4), whiteSpace: "nowrap" }}>{dateFmt(r.createdAt)}</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: r.statement || r.song ? "0.6rem" : 0 }}>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.6) }}>{personenLabel}</span>
        {r.visitCount !== null && (
          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: fg(0.45) }}>
            {r.visitCount} Besuch{r.visitCount !== 1 ? "e" : ""} · zuletzt {when(r.lastSeen)}
          </span>
        )}
      </div>
      {r.song && <div style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: fg(0.8), marginBottom: "0.4rem" }}><span style={{ color: A }}>♪</span> {r.song}</div>}
      {r.statement && (
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.85rem", color: fg(0.55), lineHeight: 1.6, borderLeft: `2px solid ${am(0.2)}`, paddingLeft: "0.6rem", marginTop: "0.4rem" }}>
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
  const chartH = 80;
  const colW = 20;

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", minWidth: `${data.length * (colW + 2)}px`, position: "relative" }}>
        {data.map((d, i) => {
          const barH = Math.max(d.visits > 0 ? Math.round((d.visits / maxVisits) * chartH) : 0, d.visits > 0 ? 2 : 0);
          const isMonday = new Date(d.date).getDay() === 1;
          const showLabel = i === 0 || i === data.length - 1 || isMonday;
          return (
            <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${colW}px`, flexShrink: 0, position: "relative" }}>
              {d.registrations > 0 && (
                <div title={`${d.registrations} Anmeldung${d.registrations > 1 ? "en" : ""}`}
                  style={{ position: "absolute", bottom: `${barH + 20}px`, width: "6px", height: "6px", borderRadius: "50%", background: "#f5e8c8", border: `1.5px solid ${A}`, zIndex: 1 }} />
              )}
              <div style={{ width: `${colW - 4}px`, height: `${barH}px`, background: d.visits > 0 ? A : am(0.12), borderRadius: "2px 2px 0 0", marginBottom: "2px", cursor: "default" }} title={`${d.date}: ${d.visits} Besuche${d.registrations > 0 ? `, ${d.registrations} Anmeldung(en)` : ""}`} />
              {showLabel && (
                <div style={{ fontSize: "0.6rem", color: fg(0.3), whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "top right", marginTop: "4px", marginRight: "4px" }}>
                  {shortDate(d.date)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "1.2rem", marginTop: "1.8rem", fontFamily: "'Lora', serif", fontSize: "0.75rem", color: fg(0.45) }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <div style={{ width: "10px", height: "10px", background: A, borderRadius: "2px" }} /> Besuche
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: FG, border: `1.5px solid ${A}` }} /> Anmeldung
        </div>
      </div>
    </div>
  );
}

function HourlyChart({ data }: { data: HourEntry[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartH = 60;
  const peakHour = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "1px" }}>
        {data.map(d => {
          const barH = Math.max(d.count > 0 ? Math.round((d.count / maxCount) * chartH) : 0, d.count > 0 ? 2 : 0);
          const isPeak = d.hour === peakHour.hour;
          return (
            <div key={d.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: "100%", height: `${barH}px`, background: isPeak ? FG : A, opacity: d.count === 0 ? 0.15 : 1, borderRadius: "1px 1px 0 0" }} title={`${d.hour}:00 Uhr — ${d.count} Besuche`} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "'Lora', serif", fontSize: "0.65rem", color: fg(0.35) }}>
        {[0, 6, 12, 18, 23].map(h => (
          <span key={h}>{h}h</span>
        ))}
      </div>
      {peakHour.count > 0 && (
        <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.8rem", color: fg(0.45), marginTop: "0.5rem" }}>
          Spitze: <span style={{ color: FG }}>{peakHour.hour}:00–{peakHour.hour + 1}:00 Uhr</span> ({peakHour.count} Besuche)
        </p>
      )}
    </div>
  );
}

function WeekdayChart({ data }: { data: WeekdayEntry[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartH = 60;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
        {data.map(d => {
          const barH = Math.max(d.count > 0 ? Math.round((d.count / maxCount) * chartH) : 0, d.count > 0 ? 2 : 0);
          return (
            <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: "100%", height: `${barH}px`, background: A, opacity: d.count === 0 ? 0.12 : 1, borderRadius: "2px 2px 0 0" }} title={`${d.day}: ${d.count} Besuche`} />
              <div style={{ fontFamily: "'Lora', serif", fontSize: "0.7rem", color: fg(0.4), marginTop: "4px" }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegTimeline({ data }: { data: RegTimelineEntry[] }) {
  if (data.length === 0) return <p style={{ color: fg(0.3), fontSize: "0.85rem" }}>Noch keine Anmeldungen.</p>;

  const dates = data.map(d => new Date(d.date).getTime());
  const minT = Math.min(...dates);
  const maxT = Math.max(...dates);
  const span = maxT - minT || 1;

  return (
    <div style={{ padding: "2rem 0 1rem", position: "relative" }}>
      <div style={{ position: "relative", height: `${data.length * 52 + 20}px` }}>
        <div style={{ position: "absolute", left: "60px", right: "8px", top: "10px", bottom: "10px", borderLeft: `2px solid ${am(0.25)}` }} />

        {data.map((r, i) => {
          const t = new Date(r.date).getTime();
          const pct = span > 0 ? ((t - minT) / span) : 0;
          const top = 10 + i * 52;
          return (
            <div key={`${r.name}-${i}`} style={{ position: "absolute", top: `${top}px`, left: 0, right: 0, display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ width: "56px", flexShrink: 0, textAlign: "right", fontFamily: "'Lora', serif", fontSize: "0.68rem", color: fg(0.35), lineHeight: 1.3, paddingTop: "2px" }}>
                {dateFmt(r.date)}
              </div>
              <div style={{ position: "relative", flexShrink: 0, width: "12px", height: "12px", marginTop: "2px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: A, border: `2px solid ${BG}`, boxShadow: `0 0 0 1px ${A}` }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.92rem", color: A, lineHeight: 1.2 }}>{r.name}</div>
                {r.song && <div style={{ fontFamily: "'Lora', serif", fontSize: "0.78rem", color: fg(0.5), marginTop: "0.15rem" }}>♪ {r.song}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(PW_KEY) === "1");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  const load = () => {
    fetch(`${BASE}/api/admin-stats?key=${SECRET}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setStats(d); setLastLoaded(new Date()); } })
      .catch(() => setError("Verbindungsfehler"));
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  if (error) return <div style={{ background: BG, color: FG, minHeight: "100svh", padding: "3rem 1.5rem", fontFamily: "'Lora', serif" }}><p style={{ color: A, marginTop: "4rem" }}>⚠ {error}</p></div>;
  if (!stats) return <div style={{ background: BG, color: FG, minHeight: "100svh", padding: "3rem 1.5rem", fontFamily: "'Lora', serif" }}><p style={{ color: fg(0.4), marginTop: "4rem" }}>Lädt …</p></div>;

  const { summary, registrations, returnerNames, dailyVisits, hourlyDistribution, weekdayDistribution, registrationTimeline, referrers, devices, todayReferrers, utmSources, languages, recent } = stats;
  const deviceRows = Object.entries(devices).sort((a, b) => b[1] - a[1]) as [string, number][];

  return (
    <div style={{ background: BG, color: FG, minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem 1.5rem", maxWidth: "800px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.4rem,4vw,2rem)", color: A, lineHeight: 1.2 }}>
          Emmerich boomt — Orga
        </h1>
        <button onClick={load} style={{ background: "transparent", border: `1px solid ${am(0.35)}`, borderRadius: "3px", color: am(0.7), cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.82rem", padding: "0.4rem 0.9rem" }}>
          Aktualisieren
        </button>
      </div>
      {lastLoaded && <p style={{ fontSize: "0.78rem", color: fg(0.35), marginBottom: "2rem" }}>Stand: {lastLoaded.toLocaleString("de-DE")}</p>}

      {/* ── Anmeldungen ── */}
      <SectionTitle>Anmeldungen ({registrations.length})</SectionTitle>
      {registrations.length === 0
        ? <p style={{ color: fg(0.3), fontSize: "0.88rem" }}>Noch keine Anmeldungen.</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {registrations.map(r => <RegCard key={r.id} r={r} />)}
          </div>
      }

      {/* ── Anmeldungs-Zeitstrahl ── */}
      {registrationTimeline.length > 0 && (
        <>
          <SectionTitle>Anmeldungs-Zeitstrahl</SectionTitle>
          <RegTimeline data={registrationTimeline} />
        </>
      )}

      {/* ── Statistik ── */}
      <SectionTitle>Statistik</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <StatCard n={summary.totalAnmeldungen}         label="Anmeldungen" />
        <StatCard n={summary.totalSessions}            label="Besuche gesamt" />
        <StatCard n={summary.todaySessions}            label="Besuche heute" />
        <StatCard n={summary.weekSessions}             label="Diese Woche" />
        <StatCard n={summary.uniqueVisitors}           label="Eindeutige Besucher" />
        <StatCard n={summary.returnVisitors}           label="Wiederkommer" />
        <StatCard n={fmt(summary.avgDurationSec)}      label="Ø Verweildauer" />
        <StatCard n={fmt(summary.todayAvgDurationSec)} label="Ø Heute" />
      </div>

      {/* ── Besuchsverlauf ── */}
      <SectionTitle>Besuchsverlauf — letzte 30 Tage</SectionTitle>
      <DailyChart data={dailyVisits} />

      {/* ── Tageszeit & Wochentag ── */}
      <SectionTitle>Wann kommen Besucher?</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2.5rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: fg(0.4), marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Uhrzeit (MEZ/MESZ)</p>
          <HourlyChart data={hourlyDistribution} />
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: fg(0.4), marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Wochentag</p>
          <WeekdayChart data={weekdayDistribution} />
        </div>
      </div>

      {/* ── Geräte & Herkunft ── */}
      <SectionTitle>Geräte & Herkunft</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.78rem", color: fg(0.4), marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Geräte</p>
          <BarChart rows={deviceRows} />
        </div>
        <div>
          <p style={{ fontSize: "0.78rem", color: fg(0.4), marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Herkunft gesamt</p>
          <BarChart rows={referrers} />
        </div>
        {todayReferrers.length > 0 && (
          <div>
            <p style={{ fontSize: "0.78rem", color: fg(0.4), marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Herkunft heute</p>
            <BarChart rows={todayReferrers} />
          </div>
        )}
        <div>
          <p style={{ fontSize: "0.78rem", color: fg(0.4), marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sprachen</p>
          <BarChart rows={languages} />
        </div>
      </div>

      {/* ── Wiederkommer ── */}
      {returnerNames.length > 0 && (
        <>
          <SectionTitle>Bekannte Wiederkommer</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {returnerNames.map(r => (
              <div key={r.name} style={{ display: "flex", gap: "0.8rem", alignItems: "center", fontFamily: "'Lora', serif", fontSize: "0.88rem" }}>
                <span style={{ color: A, fontWeight: 600, minWidth: "100px" }}>{r.name}</span>
                <span style={{ color: fg(0.5) }}>{r.visitCount} Besuche</span>
                <span style={{ color: fg(0.35), fontSize: "0.78rem" }}>zuletzt {when(r.lastSeen)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── UTM ── */}
      {utmSources.length > 0 && (
        <>
          <SectionTitle>UTM-Quellen (getrackte Links)</SectionTitle>
          <BarChart rows={utmSources} />
        </>
      )}

      {/* ── Letzte Besuche ── */}
      <SectionTitle>Letzte Besuche</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: "480px" }}>
          <thead>
            <tr>
              {["Wann", "Dauer", "Gerät", "Herkunft", "Wer"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: `1px solid ${am(0.2)}`, color: fg(0.4), fontWeight: 400, fontStyle: "italic", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(r => (
              <tr key={r.id}>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.04)}`, color: fg(0.8), whiteSpace: "nowrap" }}>{when(r.when)}</td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.04)}`, color: A, whiteSpace: "nowrap" }}>{fmt(r.duration)}</td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.04)}`, color: fg(0.7) }}>{r.device}</td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.04)}`, color: fg(0.6) }}>{r.referrer}</td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.04)}`, color: r.knownName ? A : fg(0.25), fontStyle: r.knownName ? "normal" : "italic", fontSize: "0.78rem" }}>
                  {r.knownName ?? (r.visitorId ? `${r.visitorId}…` : "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
