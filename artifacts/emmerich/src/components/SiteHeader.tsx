import { useState, useEffect } from "react";
import { useHymneAudio } from "@/contexts/HymneAudioContext";
import {
  useGetAnmeldungStats,
  getGetAnmeldungStatsQueryKey,
} from "@workspace/api-client-react";

export default function SiteHeader() {
  const [visible, setVisible] = useState(false);
  const { isPlaying, toggle } = useHymneAudio();
  const { data: statsData } = useGetAnmeldungStats({
    query: { queryKey: getGetAnmeldungStatsQueryKey(), refetchInterval: 60000 },
  });

  const angemeldete = statsData?.angemeldete_personen ?? 0;

  // Show header once the poster sentinel (placed right after Poster) leaves viewport
  useEffect(() => {
    const sentinel = document.getElementById("poster-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
  function goToAnmeldung() {
    window.history.pushState({}, "", `${BASE}/anmeldung`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <>
      <style>{`
        .sh-wrap {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 8500;
          height: 48px;
          background: rgba(10,7,4,0.96);
          border-bottom: 1px solid rgba(232,153,26,0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.2rem;
          gap: 0.75rem;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sh-wrap.sh-hidden {
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
        }
        .sh-wrap.sh-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .sh-title {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          color: rgba(232,153,26,0.55);
          white-space: nowrap;
          cursor: pointer;
          flex-shrink: 0;
          border: none;
          background: transparent;
          padding: 0;
          line-height: 1;
        }
        .sh-title:hover { color: rgba(232,153,26,0.85); }
        .sh-center {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
          justify-content: center;
          min-width: 0;
        }
        .sh-play-btn {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E8991A;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.15s;
        }
        .sh-play-btn:hover { filter: brightness(1.15); }
        .sh-play-btn svg { width: 11px; height: 11px; fill: #0A0704; }
        .sh-play-label {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.75rem;
          color: rgba(232,153,26,0.75);
          white-space: nowrap;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .sh-stat {
          display: flex;
          align-items: baseline;
          gap: 0.3em;
          white-space: nowrap;
        }
        .sh-stat-pre {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.65rem;
          color: rgba(245,232,200,0.45);
          letter-spacing: 0.03em;
        }
        .sh-stat-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: 1rem;
          color: #E8991A;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .sh-stat-label {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.7rem;
          color: rgba(245,232,200,0.5);
          letter-spacing: 0.04em;
        }
        .sh-stat-sep {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.7rem;
          color: rgba(245,232,200,0.25);
        }
        .sh-stat-avail {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.7rem;
          color: rgba(245,232,200,0.4);
          letter-spacing: 0.02em;
        }
        @media (max-width: 400px) {
          .sh-stat-sep, .sh-stat-avail { display: none; }
        }
        .sh-cta {
          flex-shrink: 0;
          font-family: 'Lora', Georgia, serif;
          font-size: 0.78rem;
          color: #0A0704;
          background: #E8991A;
          border: none;
          border-radius: 2px;
          padding: 0.35rem 0.85rem;
          cursor: pointer;
          letter-spacing: 0.03em;
          white-space: nowrap;
          transition: filter 0.15s;
        }
        .sh-cta:hover { filter: brightness(1.12); }
        @media (max-width: 480px) {
          .sh-title { display: none; }
          .sh-center { justify-content: flex-start; }
        }
      `}</style>

      <div className={`sh-wrap ${visible ? "sh-visible" : "sh-hidden"}`}>
        {/* Left — event name, click scrolls back to top */}
        <button
          className="sh-title"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Zurück nach oben"
        >
          Emmerich boomt!
        </button>

        {/* Center — play/pause + live count */}
        <div className="sh-center">
          <button
            className="sh-play-btn"
            onClick={toggle}
            aria-label={isPlaying ? "Hymne pausieren" : "Hymne abspielen"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24">
                <rect x="5" y="3" width="4" height="18" />
                <rect x="15" y="3" width="4" height="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
          <span className="sh-play-label">Hymne</span>

          <div className="sh-stat">
            <span className="sh-stat-pre">Schon</span>
            <span className="sh-stat-num">{angemeldete}</span>
            <span className="sh-stat-label">dabei</span>
            <span className="sh-stat-sep"> · </span>
            <span className="sh-stat-avail">noch Plätze frei</span>
          </div>
        </div>

        {/* Right — CTA smooth-scrolls to #formular */}
        <button className="sh-cta" onClick={goToAnmeldung}>
          Anmelden →
        </button>
      </div>
    </>
  );
}
