import { useHymneAudio } from "@/contexts/HymneAudioContext";

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function StickyHymnePlayer() {
  const { isPlaying, currentTime, duration, toggle, seek, hasStarted } = useHymneAudio();

  if (!hasStarted) return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <style>{`
        @keyframes shp-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .shp-wrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9000;
          background: rgba(10,7,4,0.96);
          border-top: 1px solid rgba(232,153,26,0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0.6rem 1.2rem 0.7rem;
          animation: shp-slide-up 0.3s ease-out both;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .shp-btn {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E8991A;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.15s;
        }
        .shp-btn:hover { filter: brightness(1.12); }
        .shp-btn svg { width: 14px; height: 14px; fill: #0A0704; }
        .shp-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .shp-title {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.78rem;
          color: #F5E8C8;
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.03em;
        }
        .shp-bar-wrap {
          position: relative;
          height: 4px;
          border-radius: 2px;
          background: rgba(232,153,26,0.18);
          cursor: pointer;
        }
        .shp-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: 2px;
          background: #E8991A;
          pointer-events: none;
        }
        .shp-time {
          flex-shrink: 0;
          font-family: 'Lora', Georgia, serif;
          font-size: 0.72rem;
          color: rgba(232,153,26,0.65);
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
      `}</style>
      <div className="shp-wrap">
        <button className="shp-btn" onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
          ) : (
            <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
          )}
        </button>
        <div className="shp-info">
          <span className="shp-title">Emmerich boomt! — Die Hymne</span>
          <div
            className="shp-bar-wrap"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const frac = (e.clientX - rect.left) / rect.width;
              seek(frac * duration);
            }}
          >
            <div className="shp-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="shp-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
    </>
  );
}
