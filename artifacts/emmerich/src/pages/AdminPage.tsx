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
  if (!stats) return <div style={{ background: BG, color: FG, minHeight: "100svh", padding: "3rem 1.5rem", fontFamily: "'Lora', serif" }}><p style={{ color: fg(0.55), marginTop: "4rem" }}>Lädt …</p></div>;

  const { summary, registrations, returnerNames, dailyVisits, hourlyDistribution, weekdayDistribution, registrationTimeline, referrers, devices, todayReferrers, utmSources, languages, browsers, oses, connectionTypes, colorSchemes, touchDevices, recent } = stats;
  const deviceRows = Object.entries(devices).sort((a, b) => b[1] - a[1]) as [string, number][];

  return (
    <div style={{ background: BG, color: FG, minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem 1.5rem", maxWidth: "820px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.5rem,4vw,2.1rem)", color: A, lineHeight: 1.2 }}>
          Emmerich boomt — Orga
        </h1>
        <button onClick={load} style={{ background: "transparent", border: `1px solid ${am(0.45)}`, borderRadius: "3px", color: am(0.85), cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "0.88rem", padding: "0.45rem 1rem" }}>
          Aktualisieren
        </button>
      </div>
      {lastLoaded && <p style={{ fontSize: "0.85rem", color: fg(0.55), marginBottom: "2rem", fontFamily: "'Lora', serif" }}>Stand: {lastLoaded.toLocaleString("de-DE")}</p>}

      {/* ── Anmeldungen ── */}
      <SectionTitle>Anmeldungen ({registrations.length})</SectionTitle>
      {registrations.length === 0
        ? <p style={{ color: fg(0.55), fontSize: "0.92rem", fontFamily: "'Lora', serif" }}>Noch keine Anmeldungen.</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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

      {/* ── Besuchsverlauf ── */}
      <SectionTitle>Besuchsverlauf — letzte 30 Tage</SectionTitle>
      <DailyChart data={dailyVisits} />

      {/* ── Tageszeit & Wochentag ── */}
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

      {/* ── Geräte & Herkunft ── */}
      <SectionTitle>Geräte & Herkunft</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem" }}>
        <div>
          <SubLabel>Geräte</SubLabel>
          <BarChart rows={deviceRows} />
        </div>
        <div>
          <SubLabel>Herkunft gesamt</SubLabel>
          <BarChart rows={referrers} />
        </div>
        {todayReferrers.length > 0 && (
          <div>
            <SubLabel>Herkunft heute</SubLabel>
            <BarChart rows={todayReferrers} />
          </div>
        )}
        <div>
          <SubLabel>Sprachen</SubLabel>
          <BarChart rows={languages} />
        </div>
      </div>

      {/* ── Browser & Betriebssystem ── */}
      <SectionTitle>Browser & Betriebssystem</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "2rem" }}>
        <div>
          <SubLabel>Browser</SubLabel>
          <BarChart rows={browsers} />
        </div>
        <div>
          <SubLabel>Betriebssystem</SubLabel>
          <BarChart rows={oses} />
        </div>
        {connectionTypes.length > 0 && (
          <div>
            <SubLabel>Verbindungstyp</SubLabel>
            <BarChart rows={connectionTypes} />
          </div>
        )}
        <div>
          <SubLabel>Farbschema</SubLabel>
          <BarChart rows={colorSchemes} />
        </div>
        {touchDevices.length > 0 && (
          <div>
            <SubLabel>Touch-Gerät</SubLabel>
            <BarChart rows={touchDevices} />
          </div>
        )}
      </div>

      {/* ── Wiederkommer ── */}
      {returnerNames.length > 0 && (
        <>
          <SectionTitle>Bekannte Wiederkommer</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {returnerNames.map(r => (
              <div key={r.name} style={{ display: "flex", gap: "1rem", alignItems: "center", fontFamily: "'Lora', serif", fontSize: "0.92rem" }}>
                <span style={{ color: A, fontWeight: 600, minWidth: "110px" }}>{r.name}</span>
                <span style={{ color: fg(0.75) }}>{r.visitCount} Besuche</span>
                <span style={{ color: fg(0.6), fontSize: "0.88rem" }}>zuletzt {when(r.lastSeen)}</span>
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
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", minWidth: "700px", fontFamily: "'Lora', serif" }}>
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
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}` }}>
                  <ScrollBar depth={r.scrollDepth} />
                </td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.65), maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.entryPath ?? undefined}>
                  {r.entryPath ?? "—"}
                </td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.6), maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.exitPath ?? undefined}>
                  {r.exitPath ?? "—"}
                </td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: fg(0.7), textAlign: "center" }}>
                  {visitOrdinal(r.visitNumber)}
                </td>
                <td style={{ padding: "0.4rem 0.6rem", borderBottom: `1px solid ${fg(0.06)}`, color: r.knownName ? A : fg(0.4), fontStyle: r.knownName ? "normal" : "italic", fontSize: "0.82rem" }}>
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
