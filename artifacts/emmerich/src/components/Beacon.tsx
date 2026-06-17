import { useEffect, useRef } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getId(key: string, store: Storage): string {
  let id = store.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    store.setItem(key, id);
  }
  return id;
}

function getUtm(param: string): string | null {
  return new URLSearchParams(window.location.search).get(param) || null;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: { effectiveType?: string; type?: string };
}

function getConnectionType(): string | null {
  const nav = navigator as NavigatorWithConnection;
  return nav.connection?.effectiveType ?? nav.connection?.type ?? null;
}

function getColorScheme(): string {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Beacon() {
  const sent = useRef(false);
  const maxScroll = useRef(0);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const sessionId = getId("emmerich_session", sessionStorage);

    const payload = {
      sessionId,
      referrer:      document.referrer || null,
      entryPath:     window.location.pathname + window.location.search,
      lang:          navigator.language || null,
      timezone:      Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      screenWidth:   screen.width   || null,
      screenHeight:  screen.height  || null,
      viewportWidth:  window.innerWidth  || null,
      viewportHeight: window.innerHeight || null,
      utmSource:   getUtm("utm_source"),
      utmMedium:   getUtm("utm_medium"),
      utmCampaign: getUtm("utm_campaign"),
      utmTerm:     getUtm("utm_term"),
      utmContent:  getUtm("utm_content"),
      connectionType: getConnectionType(),
      touchEnabled:   navigator.maxTouchPoints > 0,
      colorScheme:    getColorScheme(),
    };

    const getScrollDepth = (): number => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      return total > 0 ? Math.round((scrolled / total) * 100) : 0;
    };

    const updateMaxScroll = () => {
      const depth = getScrollDepth();
      if (depth > maxScroll.current) maxScroll.current = depth;
    };

    window.addEventListener("scroll", updateMaxScroll, { passive: true });
    updateMaxScroll();

    const post = (action: string, extra?: Record<string, unknown>) =>
      fetch(`${BASE}/api/beacon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action, ...extra }),
        keepalive: true,
      }).catch(() => {});

    post("init");

    const interval = setInterval(() => {
      post("ping", {
        scrollDepth: maxScroll.current,
        exitPath: window.location.pathname + window.location.search,
      });
    }, 30_000);

    const onHide = () => {
      if (document.visibilityState === "hidden") {
        post("ping", {
          scrollDepth: maxScroll.current,
          exitPath: window.location.pathname + window.location.search,
        });
      }
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("scroll", updateMaxScroll);
    };
  }, []);

  return null;
}
