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

export default function Beacon() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const sessionId = getId("emmerich_session", sessionStorage);
    const visitorId = getId("emmerich_visitor", localStorage);

    const payload = {
      sessionId,
      visitorId,
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
    };

    const post = (action: string) =>
      fetch(`${BASE}/api/beacon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action }),
        keepalive: true,
      }).catch(() => {});

    post("init");

    const interval = setInterval(() => post("ping"), 30_000);

    const onHide = () => {
      if (document.visibilityState === "hidden") post("ping");
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return null;
}
