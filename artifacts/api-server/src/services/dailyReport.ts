import { db } from "@workspace/db";
import { pageViews, interessenten, anmeldungenTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { sendDailyReport } from "./mailer.js";

const ADMIN_SECRET = "emmerich-orga-stats-2026";

function buildBaseUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0]!.trim()}`;
  return "http://localhost:80";
}

function ticketLink(anmeldungId: number): string {
  return `${buildBaseUrl()}/api/admin/anmeldungen/${anmeldungId}/ticket-vorschau?format=pdf&secret=${ADMIN_SECRET}`;
}

function fmt(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function parseDevice(ua: string): string {
  if (/iPad|tablet/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android|BlackBerry|IEMobile/i.test(ua)) return "Mobil";
  return "Desktop";
}

function hostOf(url: string | null): string {
  if (!url) return "Direkt";
  try { return new URL(url).hostname || "Direkt"; } catch { return url; }
}

export async function buildAndSendDailyReport(): Promise<void> {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);

  const all   = await db.select().from(pageViews).orderBy(desc(pageViews.createdAt));
  const today = all.filter(v => v.createdAt && v.createdAt >= todayStart);
  const week  = all.filter(v => v.createdAt && v.createdAt >= weekStart);

  const avgDuration = (rows: typeof all) => {
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((s, r) => s + (r.pingCount ?? 1) * 30, 0) / rows.length);
  };

  const byReferrer = (rows: typeof all) => {
    const map: Record<string, number> = {};
    for (const r of rows) {
      const key = hostOf(r.referrer);
      map[key] = (map[key] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  const byDevice = (rows: typeof all) => {
    const map: Record<string, number> = {};
    for (const r of rows) { const d = parseDevice(r.userAgent ?? ""); map[d] = (map[d] ?? 0) + 1; }
    return map;
  };

  const uniqueVis = (rows: typeof all) =>
    new Set(rows.map(r => r.visitorId ?? r.ip ?? r.sessionId)).size;

  const allAnmeldungen = await db.select().from(interessenten).orderBy(desc(interessenten.createdAt));
  const todayAnmeldungen = allAnmeldungen.filter(a => a.createdAt && a.createdAt >= todayStart);
  const weekAnmeldungen  = allAnmeldungen.filter(a => a.createdAt && a.createdAt >= weekStart);
  const gesamtPersonen   = allAnmeldungen.reduce((s, a) => s + (parseInt(a.personen) || 1), 0);

  const allPhase2 = await db.select().from(anmeldungenTable).orderBy(desc(anmeldungenTable.created_at));
  const todayPhase2 = allPhase2.filter(a => a.created_at && a.created_at >= todayStart);
  const weekPhase2  = allPhase2.filter(a => a.created_at && a.created_at >= weekStart);

  const todayRef = byReferrer(today);
  const allRef   = byReferrer(all);
  const devices  = byDevice(all);

  const tableRow = (k: string, v: string | number) =>
    `<tr><td style="padding:6px 12px;color:#6b5a3e;font-size:13px;">${k}</td><td style="padding:6px 12px;font-weight:700;color:#0a0704;">${v}</td></tr>`;

  const refRows = (rows: [string, number][]) =>
    rows.map(([k, n]) => tableRow(k, n)).join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><style>
  body{font-family:'Georgia',serif;background:#f5f0e8;margin:0;padding:20px;}
  .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);}
  .hdr{background:#0a0704;color:#e8991a;padding:28px 32px;font-size:22px;font-style:italic;letter-spacing:.02em;}
  .hdr small{display:block;color:rgba(232,153,26,.55);font-size:13px;margin-top:4px;font-style:normal;}
  .body{padding:28px 32px;}
  .section{margin-bottom:24px;}
  h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#c97d10;margin:0 0 10px;}
  table{width:100%;border-collapse:collapse;background:#faf7f2;border-radius:6px;overflow:hidden;}
  tr:nth-child(even) td{background:#f3ede2;}
  .big{font-size:36px;font-weight:700;color:#0a0704;line-height:1;margin:0;}
  .bigrow{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
  .bigcard{flex:1;min-width:110px;background:#faf7f2;border:1px solid #e8d9b8;border-radius:8px;padding:14px 16px;}
  .biglabel{font-size:12px;color:#9a8060;margin-top:4px;}
  .footer{background:#0a0704;padding:16px 32px;font-size:11px;color:rgba(245,232,200,.4);text-align:center;}
  .anm-item{border-bottom:1px solid #e8d9b8;padding:8px 0;font-size:13px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
  .anm-item:last-child{border:none;}
  .ticket-link{display:inline-block;padding:3px 10px;border:1px solid #c97d10;border-radius:4px;color:#c97d10;text-decoration:none;font-size:11px;white-space:nowrap;}
</style></head>
<body><div class="wrap">
  <div class="hdr">Emmerich boomt — Tagesbericht<small>${dateStr}</small></div>
  <div class="body">

    <div class="bigrow">
      <div class="bigcard"><p class="big">${today.length}</p><p class="biglabel">Besuche heute</p></div>
      <div class="bigcard"><p class="big">${week.length}</p><p class="biglabel">Besuche diese Woche</p></div>
      <div class="bigcard"><p class="big">${all.length}</p><p class="biglabel">Besuche gesamt</p></div>
      <div class="bigcard"><p class="big">${uniqueVis(all)}</p><p class="biglabel">Eindeutige Besucher</p></div>
    </div>

    <div class="bigrow">
      <div class="bigcard"><p class="big">${todayAnmeldungen.length}</p><p class="biglabel">Neue Anmeldungen heute</p></div>
      <div class="bigcard"><p class="big">${allAnmeldungen.length}</p><p class="biglabel">Anmeldungen gesamt</p></div>
      <div class="bigcard"><p class="big">${gesamtPersonen}</p><p class="biglabel">Personen gesamt</p></div>
    </div>

    <div class="section">
      <h3>Verweildauer</h3>
      <table>${tableRow("Ø Heute", fmt(avgDuration(today)))}${tableRow("Ø Gesamt", fmt(avgDuration(all)))}</table>
    </div>

    <div class="section">
      <h3>Geräte (gesamt)</h3>
      <table>${Object.entries(devices).sort((a, b) => b[1] - a[1]).map(([k, n]) => tableRow(k, n)).join("")}</table>
    </div>

    ${todayRef.length > 0 ? `<div class="section"><h3>Herkunft heute</h3><table>${refRows(todayRef)}</table></div>` : ""}

    <div class="section">
      <h3>Herkunft gesamt</h3>
      <table>${refRows(allRef)}</table>
    </div>

    ${todayPhase2.length > 0 ? `
    <div class="section">
      <h3>Neue Anmeldungen heute (${todayPhase2.length})</h3>
      ${todayPhase2.map(a => {
        const names = (Array.isArray(a.personen) ? a.personen as string[] : []).join(", ") || a.email;
        return `<div class="anm-item"><span><strong>${a.email}</strong> · ${a.personen_anzahl} Person(en)${names && names !== a.email ? ` · ${names}` : ""} · ${a.betrag_gesamt} €</span><a href="${ticketLink(a.id)}" class="ticket-link">Ticket PDF →</a></div>`;
      }).join("")}
    </div>` : ""}

    ${todayAnmeldungen.length > 0 ? `
    <div class="section">
      <h3>Interessenten-Formular heute</h3>
      ${todayAnmeldungen.map(a => `<div class="anm-item"><span><strong>${a.name}</strong> · ${a.personen} Person(en)${a.statement ? ` · „${a.statement}"` : ""}</span></div>`).join("")}
    </div>` : ""}

    ${weekPhase2.length > 0 ? `
    <div class="section">
      <h3>Anmeldungen diese Woche (${weekPhase2.length})</h3>
      ${weekPhase2.map(a => `<div class="anm-item"><span><strong>${a.email}</strong> · ${a.personen_anzahl} Person(en) · ${a.betrag_gesamt} €${a.song ? ` · 🎵 ${a.song}` : ""}</span><a href="${ticketLink(a.id)}" class="ticket-link">Ticket PDF →</a></div>`).join("")}
    </div>` : ""}

    ${weekAnmeldungen.length > 0 ? `
    <div class="section">
      <h3>Interessenten diese Woche (${weekAnmeldungen.length})</h3>
      ${weekAnmeldungen.map(a => `<div class="anm-item"><span><strong>${a.name}</strong> · ${a.personen} Person(en)${a.song ? ` · 🎵 ${a.song}` : ""}</span></div>`).join("")}
    </div>` : ""}

  </div>
  <div class="footer">Emmerich boomt · 18. Juli 2026 · Kapaunenberg/Am Bölt · Dieser Bericht wird täglich um 08:00 Uhr versendet</div>
</div></body></html>`;

  const text = [
    `EMMERICH BOOMT — Tagesbericht ${dateStr}`,
    "",
    `Besuche heute: ${today.length}  |  Diese Woche: ${week.length}  |  Gesamt: ${all.length}`,
    `Eindeutige Besucher: ${uniqueVis(all)}`,
    `Ø Verweildauer heute: ${fmt(avgDuration(today))}  |  Gesamt: ${fmt(avgDuration(all))}`,
    "",
    `Anmeldungen heute: ${todayAnmeldungen.length}  |  Gesamt: ${allAnmeldungen.length}  |  Personen: ${gesamtPersonen}`,
    "",
    todayPhase2.length > 0
      ? `Neue Anmeldungen heute:\n${todayPhase2.map(a => `  - ${a.email} (${a.personen_anzahl} Person(en), ${a.betrag_gesamt} €)\n    Ticket: ${ticketLink(a.id)}`).join("\n")}`
      : "Keine neuen Anmeldungen heute.",
    todayAnmeldungen.length > 0
      ? `Interessenten-Formular heute:\n${todayAnmeldungen.map(a => `  - ${a.name} (${a.personen} Person(en))`).join("\n")}`
      : "",
    "",
    `Geräte: ${Object.entries(devices).map(([k, n]) => `${k} ${n}`).join(", ")}`,
    "",
    `Herkunft: ${allRef.map(([k, n]) => `${k} (${n})`).join(", ")}`,
  ].join("\n");

  await sendDailyReport(html, text);
}
