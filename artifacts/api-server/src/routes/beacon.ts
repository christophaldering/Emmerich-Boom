import { Router } from "express";
import { db } from "@workspace/db";
import { pageViews, interessenten } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { buildAndSendDailyReport } from "../services/dailyReport.js";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "emmerich-orga-stats-2026";

function getIp(req: Parameters<Parameters<ReturnType<typeof Router>["get"]>[1]>[0]): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

function parseDevice(ua: string): string {
  if (/iPad|tablet/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android|BlackBerry|IEMobile/i.test(ua)) return "Mobil";
  return "Desktop";
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera\//i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung";
  if (/Chrome\/[0-9]/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\/[0-9]/i.test(ua)) return "Firefox";
  if (/Safari\/[0-9]/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/MSIE|Trident/i.test(ua)) return "IE";
  if (/Chromium/i.test(ua)) return "Chromium";
  return "Sonstige";
}

function parseOS(ua: string): string {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  return "Sonstige";
}

router.post("/beacon", async (req, res) => {
  try {
    const { sessionId, visitorId, referrer, action } = req.body;
    if (!sessionId) { res.json({ ok: false }); return; }

    const ip = getIp(req);
    const userAgent = (req.headers["user-agent"] ?? "").slice(0, 512);
    const ref = (referrer ?? "").slice(0, 512);

    if (action === "init") {
      const {
        entryPath, lang, timezone,
        screenWidth, screenHeight, viewportWidth, viewportHeight,
        utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        connectionType, touchEnabled, colorScheme,
      } = req.body;

      const browser = parseBrowser(userAgent);
      const os = parseOS(userAgent);

      // Calculate visit number for this visitor
      let visitNumber = 1;
      if (visitorId) {
        const prevVisits = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(pageViews)
          .where(eq(pageViews.visitorId, visitorId));
        visitNumber = (prevVisits[0]?.count ?? 0) + 1;
      }

      await db.insert(pageViews).values({
        sessionId,
        visitorId: visitorId ?? null,
        ip,
        userAgent,
        referrer: ref || null,
        entryPath: (entryPath ?? "").slice(0, 512) || null,
        lang: (lang ?? "").slice(0, 16) || null,
        timezone: (timezone ?? "").slice(0, 64) || null,
        screenWidth:    screenWidth    ? Number(screenWidth)    : null,
        screenHeight:   screenHeight   ? Number(screenHeight)   : null,
        viewportWidth:  viewportWidth  ? Number(viewportWidth)  : null,
        viewportHeight: viewportHeight ? Number(viewportHeight) : null,
        utmSource:   (utmSource   ?? "").slice(0, 256) || null,
        utmMedium:   (utmMedium   ?? "").slice(0, 128) || null,
        utmCampaign: (utmCampaign ?? "").slice(0, 128) || null,
        utmTerm:     (utmTerm     ?? "").slice(0, 128) || null,
        utmContent:  (utmContent  ?? "").slice(0, 128) || null,
        os,
        browser,
        connectionType: (connectionType ?? "").slice(0, 32) || null,
        touchEnabled:   touchEnabled != null ? Boolean(touchEnabled) : null,
        colorScheme:    (colorScheme ?? "").slice(0, 16) || null,
        visitNumber,
        pingCount: 1,
      });
    } else if (action === "ping") {
      const { scrollDepth, exitPath } = req.body;
      const rawDepth = Number(scrollDepth);
      const clampedDepth = scrollDepth != null && Number.isFinite(rawDepth)
        ? Math.min(100, Math.max(0, Math.round(rawDepth)))
        : null;
      const cleanExitPath = exitPath ? String(exitPath).slice(0, 512) : null;

      if (clampedDepth != null && cleanExitPath) {
        await db.update(pageViews).set({
          lastSeenAt: new Date(),
          pingCount: sql`${pageViews.pingCount} + 1`,
          scrollDepth: sql`GREATEST(COALESCE(${pageViews.scrollDepth}, 0), ${clampedDepth})`,
          exitPath: cleanExitPath,
        }).where(eq(pageViews.sessionId, sessionId));
      } else if (clampedDepth != null) {
        await db.update(pageViews).set({
          lastSeenAt: new Date(),
          pingCount: sql`${pageViews.pingCount} + 1`,
          scrollDepth: sql`GREATEST(COALESCE(${pageViews.scrollDepth}, 0), ${clampedDepth})`,
        }).where(eq(pageViews.sessionId, sessionId));
      } else if (cleanExitPath) {
        await db.update(pageViews).set({
          lastSeenAt: new Date(),
          pingCount: sql`${pageViews.pingCount} + 1`,
          exitPath: cleanExitPath,
        }).where(eq(pageViews.sessionId, sessionId));
      } else {
        await db.update(pageViews).set({
          lastSeenAt: new Date(),
          pingCount: sql`${pageViews.pingCount} + 1`,
        }).where(eq(pageViews.sessionId, sessionId));
      }
    }

    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

router.get("/admin-stats", async (req, res) => {
  if (req.query.key !== ADMIN_SECRET) {
    res.status(403).json({ error: "Nope." });
    return;
  }

  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);

    const [all, allReg] = await Promise.all([
      db.select().from(pageViews).orderBy(desc(pageViews.createdAt)),
      db.select().from(interessenten).orderBy(desc(interessenten.createdAt)),
    ]);

    const today = all.filter(v => v.createdAt && v.createdAt >= todayStart);
    const week  = all.filter(v => v.createdAt && v.createdAt >= weekStart);

    const avgDuration = (rows: typeof all) => {
      if (rows.length === 0) return 0;
      const total = rows.reduce((s, r) => s + (r.pingCount ?? 1) * 30, 0);
      return Math.round(total / rows.length);
    };

    const byReferrer = (rows: typeof all) => {
      const map: Record<string, number> = {};
      for (const r of rows) {
        const key = r.referrer
          ? (() => { try { return new URL(r.referrer).hostname || "Direkt"; } catch { return r.referrer || "Direkt"; } })()
          : "Direkt";
        map[key] = (map[key] ?? 0) + 1;
      }
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
    };

    const byDevice = (rows: typeof all) => {
      const map: Record<string, number> = {};
      for (const r of rows) {
        const d = parseDevice(r.userAgent ?? "");
        map[d] = (map[d] ?? 0) + 1;
      }
      return map;
    };

    const uniqueVisitors = (rows: typeof all) =>
      new Set(rows.map(r => r.visitorId ?? r.ip ?? r.sessionId)).size;

    const returnVisitors = (() => {
      const visitorDays: Record<string, Set<string>> = {};
      for (const r of all) {
        const vid = r.visitorId ?? r.ip ?? r.sessionId;
        if (!vid) continue;
        const day = (r.createdAt ?? new Date()).toISOString().slice(0, 10);
        if (!visitorDays[vid]) visitorDays[vid] = new Set();
        visitorDays[vid].add(day);
      }
      return Object.values(visitorDays).filter(days => days.size > 1).length;
    })();

    const byField = (rows: typeof all, fn: (r: typeof all[0]) => string | null) => {
      const map: Record<string, number> = {};
      for (const r of rows) {
        const key = fn(r) ?? "(unbekannt)";
        map[key] = (map[key] ?? 0) + 1;
      }
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 15);
    };

    const hostOf = (url: string | null) => {
      if (!url) return "Direkt";
      try { return new URL(url).hostname || "Direkt"; } catch { return url; }
    };

    const visitorViewMap: Record<string, { count: number; lastSeen: Date | null }> = {};
    for (const r of all) {
      if (!r.visitorId) continue;
      const vid = r.visitorId;
      if (!visitorViewMap[vid]) visitorViewMap[vid] = { count: 0, lastSeen: null };
      visitorViewMap[vid].count++;
      const ts = r.lastSeenAt ?? r.createdAt;
      if (ts && (!visitorViewMap[vid].lastSeen || ts > visitorViewMap[vid].lastSeen!)) {
        visitorViewMap[vid].lastSeen = ts;
      }
    }

    const registrations = allReg.map(r => {
      const vinfo = r.visitorId ? (visitorViewMap[r.visitorId] ?? null) : null;
      return {
        id:         r.id,
        name:       r.name,
        personen:   r.personen,
        song:       r.song ?? null,
        statement:  r.statement ?? null,
        createdAt:  r.createdAt,
        visitorId:  r.visitorId ?? null,
        visitCount: vinfo?.count ?? null,
        lastSeen:   vinfo?.lastSeen ?? null,
      };
    });

    // --- Bounce rate: sessions < 30s (pingCount <= 1) ---
    const bounceCount = all.filter(r => (r.pingCount ?? 1) <= 1).length;
    const bounceRate  = all.length > 0 ? Math.round((bounceCount / all.length) * 100) : 0;

    // --- Conversion rate: % of unique visitors who registered ---
    const registeredVisitorIds = new Set(allReg.map(r => r.visitorId).filter(Boolean));
    const totalUniqueVisitors = uniqueVisitors(all);
    const conversionRate = totalUniqueVisitors > 0
      ? Math.round((registeredVisitorIds.size / totalUniqueVisitors) * 100)
      : 0;

    // --- Avg scroll depth ---
    const scrollRows = all.filter(r => r.scrollDepth != null);
    const avgScrollDepth = scrollRows.length > 0
      ? Math.round(scrollRows.reduce((s, r) => s + (r.scrollDepth ?? 0), 0) / scrollRows.length)
      : null;

    // --- Browser & OS distribution ---
    const browsers = byField(all, r => r.browser ?? parseBrowser(r.userAgent ?? ""));
    const oses     = byField(all, r => r.os ?? parseOS(r.userAgent ?? ""));

    // --- Connection type, color scheme & touch device ---
    const connectionTypes = byField(all.filter(r => r.connectionType), r => r.connectionType);
    const colorSchemes    = byField(all, r => r.colorScheme);
    const touchDevices: [string, number][] = (() => {
      let yes = 0; let no = 0; let unknown = 0;
      for (const r of all) {
        if (r.touchEnabled === true) yes++;
        else if (r.touchEnabled === false) no++;
        else unknown++;
      }
      const result: [string, number][] = [];
      if (yes > 0) result.push(["Touch-Gerät", yes]);
      if (no > 0) result.push(["Kein Touch", no]);
      if (unknown > 0) result.push(["Unbekannt", unknown]);
      return result.sort((a, b) => b[1] - a[1]);
    })();

    const recent = all.slice(0, 100).map(r => {
      const knownName = r.visitorId
        ? (allReg.find(reg => reg.visitorId === r.visitorId)?.name ?? null)
        : null;
      return {
        id:          r.id,
        when:        r.createdAt,
        lastSeen:    r.lastSeenAt,
        duration:    (r.pingCount ?? 1) * 30,
        device:      parseDevice(r.userAgent ?? ""),
        referrer:    hostOf(r.referrer),
        visitorId:   (r.visitorId ?? "").slice(0, 8),
        knownName,
        lang:        r.lang ?? null,
        timezone:    r.timezone ?? null,
        screen:      r.screenWidth && r.screenHeight ? `${r.screenWidth}×${r.screenHeight}` : null,
        viewport:    r.viewportWidth && r.viewportHeight ? `${r.viewportWidth}×${r.viewportHeight}` : null,
        utmSource:   r.utmSource   ?? null,
        utmMedium:   r.utmMedium   ?? null,
        utmCampaign: r.utmCampaign ?? null,
        entryPath:   r.entryPath   ?? null,
        browser:     r.browser ?? parseBrowser(r.userAgent ?? ""),
        os:          r.os ?? parseOS(r.userAgent ?? ""),
        scrollDepth: r.scrollDepth ?? null,
        exitPath:    r.exitPath ?? null,
        visitNumber: r.visitNumber ?? null,
      };
    });

    const returnerNames = allReg
      .filter(r => r.visitorId && visitorViewMap[r.visitorId] && visitorViewMap[r.visitorId].count > 1)
      .map(r => ({
        name:       r.name,
        visitCount: visitorViewMap[r.visitorId!].count,
        lastSeen:   visitorViewMap[r.visitorId!].lastSeen,
      }))
      .sort((a, b) => (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0));

    // --- Time-series analytics ---
    const TZ = "Europe/Berlin";
    const tzDate = (d: Date) =>
      new Intl.DateTimeFormat("de-DE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
        .format(d).split(".").reverse().join("-"); // => "YYYY-MM-DD"
    const tzHour = (d: Date) =>
      parseInt(new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", hour12: false }).format(d), 10);
    const tzWeekdayIdx = (d: Date) => {
      const raw = d.getDay();
      return (raw + 6) % 7;  // Mo=0, Di=1, … So=6
    };

    // Daily visits — last 30 days
    const days30: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days30.push(tzDate(d));
    }
    const visitsByDay: Record<string, number> = {};
    const regsByDay:   Record<string, number> = {};
    for (const d of days30) { visitsByDay[d] = 0; regsByDay[d] = 0; }
    for (const r of all) {
      if (!r.createdAt) continue;
      const d = tzDate(r.createdAt);
      if (d in visitsByDay) visitsByDay[d]++;
    }
    for (const r of allReg) {
      if (!r.createdAt) continue;
      const d = tzDate(r.createdAt);
      if (d in regsByDay) regsByDay[d]++;
    }
    const dailyVisits = days30.map(d => ({
      date:          d,
      visits:        visitsByDay[d],
      registrations: regsByDay[d],
    }));

    // Hourly distribution (all-time)
    const hourly = new Array<number>(24).fill(0);
    for (const r of all) {
      if (!r.createdAt) continue;
      const h = tzHour(r.createdAt);
      if (h >= 0 && h < 24) hourly[h]++;
    }
    const hourlyDistribution = hourly.map((count, hour) => ({ hour, count }));

    // Weekday distribution Mo–So
    const DAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const weekday = new Array<number>(7).fill(0);
    for (const r of all) {
      if (!r.createdAt) continue;
      weekday[tzWeekdayIdx(r.createdAt)]++;
    }
    const weekdayDistribution = DAYS_DE.map((day, i) => ({ day, count: weekday[i] }));

    // Registration timeline (chronological)
    const registrationTimeline = [...allReg]
      .reverse()
      .map(r => ({ name: r.name, date: r.createdAt, song: r.song ?? null }));

    res.json({
      summary: {
        totalSessions:       all.length,
        todaySessions:       today.length,
        weekSessions:        week.length,
        uniqueVisitors:      totalUniqueVisitors,
        returnVisitors,
        avgDurationSec:      avgDuration(all),
        todayAvgDurationSec: avgDuration(today),
        totalAnmeldungen:    allReg.length,
        bounceRate,
        conversionRate,
        avgScrollDepth,
      },
      registrations,
      returnerNames,
      dailyVisits,
      hourlyDistribution,
      weekdayDistribution,
      registrationTimeline,
      referrers:      byReferrer(all),
      devices:        byDevice(all),
      todayReferrers: byReferrer(today),
      utmSources:     byField(all.filter(r => r.utmSource), r => r.utmSource),
      languages:      byField(all, r => r.lang),
      screens:        byField(all.filter(r => r.screenWidth), r => r.screenWidth && r.screenHeight ? `${r.screenWidth}×${r.screenHeight}` : null),
      browsers,
      oses,
      connectionTypes,
      colorSchemes,
      touchDevices,
      recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler" });
  }
});

router.post("/send-report", async (req, res) => {
  if (req.query.key !== ADMIN_SECRET) { res.status(403).json({ error: "Nope." }); return; }
  try {
    await buildAndSendDailyReport();
    res.json({ ok: true, message: "Bericht versendet." });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? "Fehler" });
  }
});

export default router;
