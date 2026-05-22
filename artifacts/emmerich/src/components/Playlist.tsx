import { useState, useEffect } from "react";
import {
  PHASES,
  WishEntry,
  buildSortedPlaylist,
  buildPlaylistText,
  Track,
} from "@/lib/playlistArc";
import { toInitials } from "@/utils/toInitials";

interface PlaylistProps {
  refreshKey?: number;
  highlightId?: number | null;
}

export default function Playlist({ refreshKey = 0, highlightId = null }: PlaylistProps) {
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [downloading, setDownloading] = useState(false);
  const fetchWishes = () => {
    return fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { entries: WishEntry[] }) => {
        const filtered = (data.entries ?? []).filter((e) => e.song && e.song.trim() !== "");
        setWishes(filtered);
        return filtered;
      })
      .catch(() => [] as WishEntry[]);
  };

  useEffect(() => {
    fetchWishes();
    const interval = setInterval(fetchWishes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshKey > 0) fetchWishes();
  }, [refreshKey]);

  const allTracks = buildSortedPlaylist(wishes);
  const wishCount = wishes.filter((e) => e.song && e.song.trim() !== "").length;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const fresh = await fetchWishes();
      const tracks = buildSortedPlaylist(fresh);
      const text = buildPlaylistText(tracks);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "emmerich-boomt-playlist.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  let lastPhaseIdx = -1;

  return (
    <section id="playlist" style={{ background: "var(--bg-page)", padding: "4rem 1.5rem 5rem" }}>
      <style>{`
        .pl-wrap { max-width: 760px; margin: 0 auto; }
        .pl-label { display: inline-block; font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--amber); opacity: 0.85; margin-bottom: 1rem; }
        .pl-heading { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 700; font-size: clamp(1.8rem, 5vw, 2.8rem); color: var(--warm); line-height: 1.15; margin-bottom: 1.2rem; }
        .pl-intro { font-family: 'Lora', serif; font-size: 1rem; line-height: 1.8; color: var(--fg-80); margin-bottom: 2.5rem; max-width: 60ch; }
        .pl-intro em { font-style: italic; color: var(--amber); }

        .pl-count { font-family: 'Lora', serif; font-style: italic; font-size: 0.88rem; color: var(--fg-55); margin-bottom: 1.5rem; }
        .pl-count strong { color: var(--amber); font-style: normal; font-weight: 600; }

        .pl-phase-divider { display: flex; align-items: center; gap: 0.8rem; margin: 1.6rem 0 0; }
        .pl-phase-line { flex: 1; height: 1px; background: var(--fg-08); }
        .pl-phase-name { font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--amber); opacity: 0.6; white-space: nowrap; }
        .pl-phase-icon { font-size: 0.75rem; opacity: 0.4; }
        .pl-phase-kai { font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; color: var(--fg-55); margin: 0.18rem 0 0.4rem; text-align: center; }

        .pl-list { display: flex; flex-direction: column; }
        .pl-row { display: flex; align-items: baseline; gap: 0.9rem; padding: 0.6rem 0; border-bottom: 1px solid var(--fg-06); transition: background 0.3s; border-radius: 2px; }
        .pl-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-row--highlight { animation: pl-glow 2.5s ease-out forwards; }
        @keyframes pl-glow {
          0%   { background: color-mix(in srgb, var(--amber) 22%, transparent); }
          60%  { background: color-mix(in srgb, var(--amber) 10%, transparent); }
          100% { background: transparent; }
        }
        .pl-num { font-family: 'Lora', serif; font-size: 0.72rem; color: var(--fg-50); min-width: 1.6rem; flex-shrink: 0; text-align: right; }
        .pl-who { font-family: 'Lora', serif; font-size: 0.72rem; font-style: italic; color: var(--fg-70); min-width: 4.5rem; max-width: 6rem; flex-shrink: 0; line-height: 1.6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pl-note { font-size: 0.82rem; color: var(--amber); opacity: 0.5; flex-shrink: 0; }
        .pl-song-text { font-family: 'Lora', serif; font-size: 0.95rem; color: var(--fg-88); line-height: 1.5; flex: 1; }
        .pl-song-text strong { font-weight: 600; color: var(--warm); }

        .pl-download-wrap { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--fg-08); display: flex; flex-direction: column; gap: 0.55rem; align-items: flex-start; }
        .pl-download-info { font-family: 'Lora', serif; font-style: italic; font-size: 0.9rem; color: var(--fg-55); line-height: 1.6; }
        .pl-dl-btn { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Playfair Display', serif; font-style: italic; font-size: 1rem; color: var(--amber); background: transparent; border: 1px solid var(--amber); border-radius: 3px; padding: 0.75rem 1.4rem; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .pl-dl-btn:hover:not(:disabled) { background: var(--amber); color: var(--black); }
        .pl-dl-btn:disabled { opacity: 0.5; cursor: default; }
        .pl-cta { font-family: 'Lora', serif; font-style: italic; font-size: 0.88rem; color: var(--fg-40); line-height: 1.7; margin-top: 0.25rem; }
        .pl-cta a { color: var(--amber); text-underline-offset: 3px; }
      `}</style>

      <div className="pl-wrap">
        <span className="pl-label">Musik</span>
        <h2 className="pl-heading">Die Playlist wächst.</h2>
        <p className="pl-intro">
          Kein reines 70er-/80er-Konzert — <em>auch euer aktuelles Lieblingslied hat hier seinen Platz.</em>{" "}
          Von Tanzflächen-Klassikern bis zu Songs, die heute noch in den Charts stehen. Quer durch die Jahrzehnte,
          zusammengestellt von uns — und von euch. Sortiert nach Partyabend-Dramaturgie: von sanft bis euphorisch.
        </p>

        <p className="pl-count">
          Aktuell <strong>{allTracks.length} Songs</strong> — {wishCount === 0
            ? "noch keine Community-Wünsche eingegangen"
            : `davon ${wishCount} ${wishCount === 1 ? "Wunsch" : "Wünsche"} von euch`}
        </p>

        <div className="pl-list">
          {allTracks.map((t: Track, i: number) => {
            const phaseIdx = PHASES.findIndex((p) => t.energy >= p.min && t.energy <= p.max);
            const showDivider = phaseIdx !== lastPhaseIdx;
            if (showDivider) lastPhaseIdx = phaseIdx;
            const phase = PHASES[phaseIdx];
            const highlightKey = highlightId !== null ? `w${highlightId}` : null;
            const isHighlight = highlightKey !== null && (t.key === highlightKey || (t.memberKeys?.includes(highlightKey) ?? false));

            return (
              <div key={t.key}>
                {showDivider && (
                  <>
                    <div className="pl-phase-divider">
                      <div className="pl-phase-line" />
                      <span className="pl-phase-name">{phase?.name}</span>
                      <div className="pl-phase-line" />
                    </div>
                    {phase?.kai && <p className="pl-phase-kai">{phase.kai}</p>}
                  </>
                )}
                <div
                  className={`pl-row${isHighlight ? " pl-row--highlight" : ""}`}

                >
                  <span className="pl-num">{i + 1}</span>
                  <span className="pl-who">{t.displayName ?? ""}</span>
                  <span className="pl-note">♪</span>
                  <span className="pl-song-text">
                    <strong>{t.artist}</strong>
                    {t.title && ` – ${t.title}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pl-download-wrap">
          <p className="pl-download-info">
            Komplette Playlist als Textdatei — immer auf dem aktuellen Stand, nach Partyabend-Dramaturgie sortiert.
          </p>
          <button className="pl-dl-btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Wird geladen …" : `↓ Playlist herunterladen (${allTracks.length} Songs)`}
          </button>
        </div>
      </div>
    </section>
  );
}
