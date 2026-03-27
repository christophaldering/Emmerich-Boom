import { useEffect, useState } from "react";

const SECRET = "emmerich-orga-stats-2026";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Visit {
  id: number;
  when: string;
  lastSeen: string;
  duration: number;
  device: string;
  referrer: string;
  visitorId: string;
  lang: string | null;
  timezone: string | null;
  screen: string | null;
  viewport: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  entryPath: string | null;
}

interface Stats {
  summary: {
    totalSessions: number;
    todaySessions: number;
    weekSessions: number;
    uniqueVisitors: number;
    returnVisitors: number;
    avgDurationSec: number;
    todayAvgDurationSec: number;
  };
  referrers: [string, number][];
  devices: Record<string, number>;
  todayReferrers: [string, number][];
  utmSources: [string, number][];
  languages: [string, number][];
  screens: [string, number][];
  recent: Visit[];
}

function fmt(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function when(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

const S: Record<string, React.CSSProperties> = {
  page: { background: "#0a0704", color: "#f5e8c8", minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem 1.5rem" },
  h1: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.5rem,4vw,2.2rem)", color: "#e8991a", marginBottom: "0.25rem" },
  sub: { fontSize: "0.85rem", color: "rgba(245,232,200,0.45)", marginBottom: "2.5rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem" },
  card: { background: "rgba(245,232,200,0.04)", border: "1px solid rgba(232,153,26,0.18)", borderRadius: "6px", padding: "1rem 1.2rem" },
  num: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem", color: "#e8991a", lineHeight: 1 },
  label: { fontSize: "0.78rem", color: "rgba(245,232,200,0.55)", marginTop: "0.3rem" },
  sectionH: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: "#e8991a", marginBottom: "0.75rem", marginTop: "2rem", borderBottom: "1px solid rgba(232,153,26,0.15)", paddingBottom: "0.4rem" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.85rem" },
  th: { textAlign: "left" as const, padding: "0.4rem 0.6rem", borderBottom: "1px solid rgba(232,153,26,0.2)", color: "rgba(245,232,200,0.45)", fontWeight: 400, fontStyle: "italic", whiteSpace: "nowrap" as const },
  td: { padding: "0.4rem 0.6rem", borderBottom: "1px solid rgba(245,232,200,0.04)", color: "rgba(245,232,200,0.85)", verticalAlign: "top" as const },
  tdAmber: { padding: "0.4rem 0.6rem", borderBottom: "1px solid rgba(245,232,200,0.04)", color: "#e8991a", textAlign: "right" as const },
  tdFaint: { padding: "0.4rem 0.6rem", borderBottom: "1px solid rgba(245,232,200,0.04)", color: "rgba(245,232,200,0.35)", fontSize: "0.75rem" },
};

function KVTable({ rows }: { rows: [string, number][] }) {
  if (rows.length === 0) return <p style={{ color: "rgba(245,232,200,0.3)", fontSize: "0.85rem" }}>Noch keine Daten</p>;
  return (
    <table style={S.table}>
      <tbody>
        {rows.map(([k, n]) => (
          <tr key={k}>
            <td style={S.td}>{k || "—"}</td>
            <td style={S.tdAmber}>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    fetch(`${BASE}/api/admin-stats?key=${SECRET}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setStats(d); })
      .catch(() => setError("Verbindungsfehler"));

  useEffect(() => { load(); }, []);

  if (error) return <div style={S.page}><p style={{ color: "#e8991a", marginTop: "4rem" }}>⚠ {error}</p></div>;
  if (!stats) return <div style={S.page}><p style={{ color: "rgba(245,232,200,0.4)", marginTop: "4rem" }}>Lädt …</p></div>;

  const { summary, referrers, devices, todayReferrers, utmSources, languages, screens, recent } = stats;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Emmerich boomt — Orga-Übersicht</h1>
      <p style={S.sub}>
        Nur für interne Nutzung · Stand: {new Date().toLocaleString("de-DE")} ·{" "}
        <button onClick={load} style={{ background: "none", border: "none", color: "rgba(232,153,26,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>
          Aktualisieren
        </button>
      </p>

      <div style={S.grid}>
        {[
          { n: summary.totalSessions,       l: "Besuche gesamt" },
          { n: summary.todaySessions,        l: "Besuche heute" },
          { n: summary.weekSessions,         l: "Besuche diese Woche" },
          { n: summary.uniqueVisitors,       l: "Eindeutige Besucher" },
          { n: summary.returnVisitors,       l: "Wiederkommer" },
          { n: fmt(summary.avgDurationSec),  l: "Ø Verweildauer" },
          { n: fmt(summary.todayAvgDurationSec), l: "Ø Heute" },
        ].map(({ n, l }) => (
          <div key={l} style={S.card}>
            <div style={S.num}>{n}</div>
            <div style={S.label}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
        <div>
          <h2 style={S.sectionH}>Geräte</h2>
          <KVTable rows={Object.entries(devices).sort((a, b) => b[1] - a[1]) as [string, number][]} />
        </div>
        <div>
          <h2 style={S.sectionH}>Herkunft gesamt</h2>
          <KVTable rows={referrers} />
        </div>
        {todayReferrers.length > 0 && (
          <div>
            <h2 style={S.sectionH}>Herkunft heute</h2>
            <KVTable rows={todayReferrers} />
          </div>
        )}
        {utmSources.length > 0 && (
          <div>
            <h2 style={S.sectionH}>UTM-Quellen (getrackte Links)</h2>
            <KVTable rows={utmSources} />
          </div>
        )}
        <div>
          <h2 style={S.sectionH}>Sprachen</h2>
          <KVTable rows={languages} />
        </div>
        <div>
          <h2 style={S.sectionH}>Bildschirmgrößen</h2>
          <KVTable rows={screens} />
        </div>
      </div>

      <h2 style={{ ...S.sectionH, marginTop: "2.5rem" }}>Letzte 100 Besuche</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...S.table, minWidth: "860px" }}>
          <thead>
            <tr>
              {["Wann", "Zuletzt", "Dauer", "Gerät", "Bildschirm", "Viewport", "Herkunft", "UTM", "Sprache", "Zeitzone", "Pfad", "ID"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(r => (
              <tr key={r.id}>
                <td style={S.td}>{when(r.when)}</td>
                <td style={S.tdFaint}>{when(r.lastSeen)}</td>
                <td style={{ ...S.td, color: "#e8991a" }}>{fmt(r.duration)}</td>
                <td style={S.td}>{r.device}</td>
                <td style={S.tdFaint}>{r.screen ?? "—"}</td>
                <td style={S.tdFaint}>{r.viewport ?? "—"}</td>
                <td style={S.td}>{r.referrer}</td>
                <td style={S.tdFaint}>{r.utmSource ? `${r.utmSource}${r.utmMedium ? `/${r.utmMedium}` : ""}${r.utmCampaign ? `/${r.utmCampaign}` : ""}` : "—"}</td>
                <td style={S.tdFaint}>{r.lang ?? "—"}</td>
                <td style={S.tdFaint}>{r.timezone ?? "—"}</td>
                <td style={S.tdFaint}>{r.entryPath ?? "—"}</td>
                <td style={S.tdFaint}>{r.visitorId}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
