import { useEffect, useState } from "react";

const SECRET = "emmerich-orga-stats-2026";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
  recent: {
    id: number;
    when: string;
    lastSeen: string;
    duration: number;
    device: string;
    referrer: string;
    visitorId: string;
  }[];
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
  page: { background: "#0a0704", color: "#f5e8c8", minHeight: "100svh", fontFamily: "'Lora', serif", padding: "2rem" },
  h1: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#e8991a", marginBottom: "0.25rem" },
  sub: { fontSize: "0.85rem", color: "rgba(245,232,200,0.5)", marginBottom: "2.5rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2.5rem" },
  card: { background: "rgba(245,232,200,0.04)", border: "1px solid rgba(232,153,26,0.18)", borderRadius: "6px", padding: "1rem 1.2rem" },
  num: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2.2rem", color: "#e8991a", lineHeight: 1 },
  label: { fontSize: "0.8rem", color: "rgba(245,232,200,0.6)", marginTop: "0.3rem" },
  sectionH: { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.1rem", color: "#e8991a", marginBottom: "0.75rem", marginTop: "2rem" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.88rem" },
  th: { textAlign: "left" as const, padding: "0.5rem 0.75rem", borderBottom: "1px solid rgba(232,153,26,0.2)", color: "rgba(245,232,200,0.55)", fontWeight: 400, fontStyle: "italic" },
  td: { padding: "0.5rem 0.75rem", borderBottom: "1px solid rgba(245,232,200,0.05)", color: "rgba(245,232,200,0.88)" },
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/admin-stats?key=${SECRET}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setStats(d); })
      .catch(() => setError("Verbindungsfehler"));
  }, []);

  if (error) return <div style={S.page}><p style={{ color: "#e8991a", marginTop: "4rem" }}>⚠ {error}</p></div>;
  if (!stats) return <div style={S.page}><p style={{ color: "rgba(245,232,200,0.4)", marginTop: "4rem" }}>Lädt …</p></div>;

  const { summary, referrers, devices, todayReferrers, recent } = stats;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Emmerich boomt — Orga-Übersicht</h1>
      <p style={S.sub}>Nur für interne Nutzung · Automatisch aktualisiert beim Laden</p>

      <div style={S.grid}>
        {[
          { n: summary.totalSessions, l: "Besuche gesamt" },
          { n: summary.todaySessions, l: "Besuche heute" },
          { n: summary.weekSessions, l: "Besuche diese Woche" },
          { n: summary.uniqueVisitors, l: "Eindeutige Besucher" },
          { n: summary.returnVisitors, l: "Wiederkommer" },
          { n: fmt(summary.avgDurationSec), l: "Ø Verweildauer" },
          { n: fmt(summary.todayAvgDurationSec), l: "Ø Verweildauer heute" },
        ].map(({ n, l }) => (
          <div key={l} style={S.card}>
            <div style={S.num}>{n}</div>
            <div style={S.label}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2rem" }}>
        <div>
          <h2 style={S.sectionH}>Geräte (gesamt)</h2>
          <table style={S.table}>
            <tbody>
              {Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([d, n]) => (
                <tr key={d}>
                  <td style={S.td}>{d}</td>
                  <td style={{ ...S.td, color: "#e8991a", textAlign: "right" }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={S.sectionH}>Herkunft (gesamt)</h2>
          <table style={S.table}>
            <tbody>
              {referrers.map(([r, n]) => (
                <tr key={r}>
                  <td style={S.td}>{r}</td>
                  <td style={{ ...S.td, color: "#e8991a", textAlign: "right" }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {todayReferrers.length > 0 && (
          <div>
            <h2 style={S.sectionH}>Herkunft heute</h2>
            <table style={S.table}>
              <tbody>
                {todayReferrers.map(([r, n]) => (
                  <tr key={r}>
                    <td style={S.td}>{r}</td>
                    <td style={{ ...S.td, color: "#e8991a", textAlign: "right" }}>{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 style={{ ...S.sectionH, marginTop: "2.5rem" }}>Letzte 50 Besuche</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Wann", "Zuletzt aktiv", "Verweildauer", "Gerät", "Herkunft", "Besucher-ID"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(r => (
              <tr key={r.id}>
                <td style={S.td}>{when(r.when)}</td>
                <td style={S.td}>{when(r.lastSeen)}</td>
                <td style={{ ...S.td, color: "#e8991a" }}>{fmt(r.duration)}</td>
                <td style={S.td}>{r.device}</td>
                <td style={S.td}>{r.referrer}</td>
                <td style={{ ...S.td, color: "rgba(245,232,200,0.4)", fontSize: "0.78rem" }}>{r.visitorId}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
