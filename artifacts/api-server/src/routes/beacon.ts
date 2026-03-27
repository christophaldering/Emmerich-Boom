import { Router } from "express";
import { db } from "@workspace/db";
import { pageViews } from "@workspace/db";
import { eq, desc, gte, sql, count, countDistinct } from "drizzle-orm";

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
        utmSource, utmMedium, utmCampaign,
      } = req.body;

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
        pingCount: 1,
      });
    } else if (action === "ping") {
      await db
        .update(pageViews)
        .set({
          lastSeenAt: new Date(),
          pingCount: sql`${pageViews.pingCount} + 1`,
        })
        .where(eq(pageViews.sessionId, sessionId));
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

    const all = await db.select().from(pageViews).orderBy(desc(pageViews.createdAt));

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

    const recent = all.slice(0, 100).map(r => ({
      id:          r.id,
      when:        r.createdAt,
      lastSeen:    r.lastSeenAt,
      duration:    (r.pingCount ?? 1) * 30,
      device:      parseDevice(r.userAgent ?? ""),
      referrer:    hostOf(r.referrer),
      visitorId:   (r.visitorId ?? "").slice(0, 8),
      lang:        r.lang ?? null,
      timezone:    r.timezone ?? null,
      screen:      r.screenWidth && r.screenHeight ? `${r.screenWidth}×${r.screenHeight}` : null,
      viewport:    r.viewportWidth && r.viewportHeight ? `${r.viewportWidth}×${r.viewportHeight}` : null,
      utmSource:   r.utmSource   ?? null,
      utmMedium:   r.utmMedium   ?? null,
      utmCampaign: r.utmCampaign ?? null,
      entryPath:   r.entryPath   ?? null,
    }));

    res.json({
      summary: {
        totalSessions:       all.length,
        todaySessions:       today.length,
        weekSessions:        week.length,
        uniqueVisitors:      uniqueVisitors(all),
        returnVisitors,
        avgDurationSec:      avgDuration(all),
        todayAvgDurationSec: avgDuration(today),
      },
      referrers:      byReferrer(all),
      devices:        byDevice(all),
      todayReferrers: byReferrer(today),
      utmSources:     byField(all.filter(r => r.utmSource), r => r.utmSource),
      languages:      byField(all, r => r.lang),
      screens:        byField(all.filter(r => r.screenWidth), r => r.screenWidth && r.screenHeight ? `${r.screenWidth}×${r.screenHeight}` : null),
      recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler" });
  }
});

export default router;
