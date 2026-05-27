import { useHymneAudio } from "@/contexts/HymneAudioContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const DOWNLOAD_URL = `${BASE}/audio/emmerich-boomt.mp3`;
const COVER_URL = `${BASE}/images/hymne-cover.jpg`;

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const STROPHEN = [
  {
    lines: [
      "An der Theke der Sozietät, da nahm das Unheil seinen Lauf,",
      "ein Pils, ein Alt, 'ne Schnapsidee — und keiner hörte auf.",
      "Tulpensonntag '24, daran erinnert sich noch wer —",
      "seitdem geh'n wir nicht nüchtern heim. Na und, wer fragt schon sehr?",
    ],
  },
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt — und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  {
    lines: [
      "Sie nennen uns die Boomer — ja bitte, gern geschehn.",
      "wir tanzen noch zu Platten, die hat keiner mehr gesehn.",
      "Das Handy liegt im Eck, das W-LAN ist uns schnuppe,",
      "am Feierabendmarkt am Rhein steht schon die halbe Truppe.",
    ],
  },
  {
    lines: [
      "Kein Tinder, kein Insta, kein Status, kein Like —",
      "nur Theke, nur Truppe, nur Bier — und nur wir!",
    ],
  },
  {
    refrain: true,
    lines: [
      "Emmerich boomt! — und wir boomen mit,",
      "oben am Kapaunenberg, da singen wir uns'ren Hit!",
      "Am Bölt, an der Theke, da gehör'n wir hin —",
      "Emmerich boomt — und wir mittendrin!",
      "Emmerich boomt — und wir boomen mit!",
    ],
  },
  {
    lines: [
      "Wir sind nicht jung — na gut. Wir sind genau richtig.",
      "Wir halten zusammen, im Spaß und auch im Wichtig.",
      "Und wenn der Rhein vorbeizieht und der Abend leise wird,",
      "dann weiß ein jeder hier: in Emmerich ist man nie verirrt.",
    ],
  },
  {
    lines: [
      "Die Knie machen Krach, der Rücken hat Beschwerden,",
      "doch oben aufm Bölt, da woll'n wir achtzehn werden!",
      "Ein Bier, ein Lied, die Bude bebt, der DJ legt nochmal auf —",
      "und morgen früh? Egal. Wir nehmen das in Kauf!",
    ],
  },
];

// Manually calibrated timestamps (seconds) for each line, matching STROPHEN structure.
// Adjust these values after listening to the actual recording.
const LINE_TIMESTAMPS: number[][] = [
  // Strophe 1
  [3.5, 7.5, 11.5, 15.5],
  // Strophe 2 (Kein Tinder…)
  [20.5, 24.0],
  // Refrain 1
  [27.5, 31.0, 34.5, 37.5, 40.5],
  // Strophe 3 (Sie nennen uns…)
  [44.5, 48.5, 52.5, 56.5],
  // Strophe 4 (Kein Tinder…)
  [61.0, 64.5],
  // Refrain 2
  [68.0, 71.5, 75.0, 78.0, 81.0],
  // Strophe 5 (Wir sind nicht jung…)
  [85.0, 89.0, 93.0, 97.0],
  // Strophe 6 (Die Knie machen Krach…)
  [101.5, 105.5, 109.5, 113.5],
];

// Build a flat list of { si, li, startTime } for binary-search lookup
const FLAT_TIMESTAMPS = LINE_TIMESTAMPS.flatMap((strophe, si) =>
  strophe.map((startTime, li) => ({ si, li, startTime }))
).sort((a, b) => a.startTime - b.startTime);

function getActiveLine(currentTime: number): { si: number; li: number } | null {
  if (currentTime <= 0) return null;
  let active: { si: number; li: number } | null = null;
  for (const entry of FLAT_TIMESTAMPS) {
    if (entry.startTime <= currentTime) {
      active = { si: entry.si, li: entry.li };
    } else {
      break;
    }
  }
  return active;
}

export default function Hymne() {
  const { isPlaying, currentTime, duration, toggle, seek, hasStarted } = useHymneAudio();

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeLine = hasStarted ? getActiveLine(currentTime) : null;
  const showKaraoke = hasStarted;

  return (
    <section style={{ background: "#0A0704", borderBottom: "1px solid rgba(232,153,26,0.25)" }}>
      <style>{`
        .hymne-cover-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        .hymne-cover-img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 520px;
          object-fit: cover;
          object-position: center top;
        }
        .hymne-cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,7,4,0) 50%, rgba(10,7,4,1) 100%);
        }
        .hymne-inner {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .hymne-eyebrow {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.75rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #E8991A;
          opacity: 0.8;
          margin: 0 0 0.6rem;
        }
        .hymne-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          font-size: clamp(1.8rem, 6vw, 3rem);
          color: #F5E8C8;
          line-height: 1.1;
          margin: 0 0 2rem;
        }
        .hymne-title em {
          color: #E8991A;
          font-style: italic;
        }
        .hymne-player {
          background: rgba(232,153,26,0.07);
          border: 1px solid rgba(232,153,26,0.22);
          border-radius: 6px;
          padding: 1.2rem 1.4rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .hymne-play-btn {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #E8991A;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.15s, transform 0.1s;
        }
        .hymne-play-btn:hover { filter: brightness(1.1); transform: scale(1.05); }
        .hymne-play-btn svg { width: 18px; height: 18px; fill: #0A0704; }
        .hymne-player-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .hymne-player-bar-wrap {
          position: relative;
          height: 5px;
          border-radius: 3px;
          background: rgba(232,153,26,0.18);
          cursor: pointer;
        }
        .hymne-player-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: 3px;
          background: #E8991A;
          pointer-events: none;
          transition: width 0.3s linear;
        }
        .hymne-player-time {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.72rem;
          color: rgba(232,153,26,0.6);
          letter-spacing: 0.05em;
        }
        .hymne-download {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.82rem;
          color: rgba(232,153,26,0.65);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.15s;
          margin-bottom: 3rem;
        }
        .hymne-download:hover { color: #E8991A; }
        .hymne-divider {
          width: 2.5rem;
          height: 2px;
          background: rgba(232,153,26,0.35);
          margin-bottom: 2.5rem;
        }
        .hymne-strophe {
          margin-bottom: 1.8rem;
        }
        .hymne-strophe-line {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: clamp(0.95rem, 2.2vw, 1.05rem);
          line-height: 1.85;
          color: rgba(245,232,200,0.78);
          display: block;
          transition: color 0.35s ease, opacity 0.35s ease;
        }
        .hymne-refrain-line {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(1rem, 2.4vw, 1.12rem);
          line-height: 1.75;
          color: #E8991A;
          display: block;
          transition: color 0.35s ease, opacity 0.35s ease;
        }
        .hymne-strophe-line.karaoke-dim {
          color: rgba(245,232,200,0.28);
        }
        .hymne-refrain-line.karaoke-dim {
          color: rgba(232,153,26,0.28);
        }
        .hymne-strophe-line.karaoke-active {
          color: #F5C842;
          text-shadow: 0 0 18px rgba(245,200,66,0.35);
        }
        .hymne-refrain-line.karaoke-active {
          color: #F5C842;
          text-shadow: 0 0 18px rgba(245,200,66,0.35);
        }
        .hymne-footer-line {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232,153,26,0.45);
          text-align: center;
          margin-top: 2.5rem;
        }
      `}</style>

      {/* Cover image with gradient overlay */}
      <div className="hymne-cover-wrap">
        <img
          src={COVER_URL}
          alt="Boomer Club Emmerich — Emmerich boomt! Die Hymne"
          className="hymne-cover-img"
        />
        <div className="hymne-cover-overlay" />
      </div>

      <div className="hymne-inner">
        <p className="hymne-eyebrow">Die Hymne vom Boomerclub Emmerich</p>
        <h2 className="hymne-title">
          Emmerich <em>boomt!</em>
        </h2>

        {/* Player */}
        <div className="hymne-player">
          <button className="hymne-play-btn" onClick={toggle} aria-label={isPlaying ? "Pause" : "Abspielen"}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
          <div className="hymne-player-info">
            <div
              className="hymne-player-bar-wrap"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const frac = (e.clientX - rect.left) / rect.width;
                seek(frac * duration);
              }}
            >
              <div className="hymne-player-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="hymne-player-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Download */}
        <a
          href={DOWNLOAD_URL}
          download="Emmerich-boomt-Die-Hymne.mp3"
          className="hymne-download"
        >
          ♪ Herunterladen
        </a>

        <div className="hymne-divider" />

        {/* Songtext */}
        {STROPHEN.map((strophe, si) => (
          <div key={si} className="hymne-strophe">
            {strophe.lines.map((line, li) => {
              const isActive =
                activeLine !== null &&
                activeLine.si === si &&
                activeLine.li === li;
              const isDim = showKaraoke && !isActive;
              const baseClass = strophe.refrain
                ? "hymne-refrain-line"
                : "hymne-strophe-line";
              const karaokeClass = isActive
                ? "karaoke-active"
                : isDim
                ? "karaoke-dim"
                : "";
              return (
                <span
                  key={li}
                  className={`${baseClass}${karaokeClass ? ` ${karaokeClass}` : ""}`}
                >
                  {line}
                </span>
              );
            })}
          </div>
        ))}

        <p className="hymne-footer-line">♪ 18. Juli 2026 · Bölt / Kapaunenberg ♪</p>
      </div>
    </section>
  );
}
