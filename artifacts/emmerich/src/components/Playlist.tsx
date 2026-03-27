import { useState, useEffect } from "react";

interface PlaylistProps {
  refreshKey?: number;
}

type Entry = {
  id: number;
  name: string;
  song: string | null;
};

type Track = {
  key: string;
  label: string;
  artist: string;
  title: string;
  wishBy?: string;
};

const CURATED: Track[] = [
  { key: "c0",  label: "70er",   artist: "ABBA",                        title: "Dancing Queen" },
  { key: "c1",  label: "70er",   artist: "Earth, Wind & Fire",           title: "September" },
  { key: "c2",  label: "70er",   artist: "Queen",                        title: "Bohemian Rhapsody" },
  { key: "c3",  label: "70er",   artist: "Boney M.",                     title: "Rivers of Babylon" },
  { key: "c4",  label: "70er",   artist: "Gloria Gaynor",                title: "I Will Survive" },
  { key: "c5",  label: "80er",   artist: "Duran Duran",                  title: "Rio" },
  { key: "c6",  label: "80er",   artist: "Nena",                         title: "99 Luftballons" },
  { key: "c7",  label: "80er",   artist: "a-ha",                         title: "Take On Me" },
  { key: "c8",  label: "80er",   artist: "Toto",                         title: "Africa" },
  { key: "c9",  label: "80er",   artist: "Depeche Mode",                 title: "Personal Jesus" },
  { key: "c10", label: "80er",   artist: "Cyndi Lauper",                 title: "Girls Just Want to Have Fun" },
  { key: "c11", label: "90er",   artist: "Haddaway",                     title: "What Is Love" },
  { key: "c12", label: "90er",   artist: "Snap!",                        title: "Rhythm Is a Dancer" },
  { key: "c13", label: "90er",   artist: "Die Fantastischen Vier",       title: "Die Da" },
  { key: "c14", label: "2000er", artist: "Amy Winehouse",                title: "Rehab" },
  { key: "c15", label: "2010er", artist: "Mark Ronson ft. Bruno Mars",   title: "Uptown Funk" },
  { key: "c16", label: "2010er", artist: "Pharrell Williams",            title: "Happy" },
  { key: "c17", label: "2020er", artist: "Dua Lipa",                     title: "Levitating" },
  { key: "c18", label: "2020er", artist: "Harry Styles",                 title: "As It Was" },
];

function buildPlaylistText(tracks: Track[]): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const sep = "─".repeat(50);

  const lines: string[] = [
    "EMMERICH BOOMT! — Die Playlist",
    "Boomer-Party · Samstag, 18. Juli 2026 · Bölt (Kapaunenberg)",
    `Stand: ${dateStr}`,
    sep,
    "",
  ];

  tracks.forEach((t, i) => {
    const num = String(i + 1).padStart(2, " ");
    const label = `[${t.label}]`.padEnd(9);
    const song = t.wishBy
      ? `${t.artist} – ${t.title}  (Wunsch von ${t.wishBy})`
      : `${t.artist} – ${t.title}`;
    lines.push(`${num}.  ${label}  ${song}`);
  });

  lines.push("");
  lines.push(sep);
  lines.push(`Insgesamt: ${tracks.length} Songs · emmerich-boomt.replit.app`);

  return lines.join("\n");
}

export default function Playlist({ refreshKey = 0 }: PlaylistProps) {
  const [wishes, setWishes] = useState<Entry[]>([]);
  const [downloading, setDownloading] = useState(false);

  const fetchWishes = () => {
    return fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Entry[]) => {
        const filtered = data.filter((e) => e.song && e.song.trim() !== "");
        setWishes(filtered);
        return filtered;
      })
      .catch(() => wishes);
  };

  useEffect(() => {
    fetchWishes();
    const interval = setInterval(fetchWishes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (refreshKey > 0) fetchWishes(); }, [refreshKey]);

  const wishTracks: Track[] = wishes.map((e) => {
    const raw = e.song!.trim();
    const dashIdx = raw.indexOf(" – ");
    const artist = dashIdx > 0 ? raw.slice(0, dashIdx) : raw;
    const title  = dashIdx > 0 ? raw.slice(dashIdx + 3) : "";
    return { key: `w${e.id}`, label: "♥", artist, title: title || artist, wishBy: e.name };
  });

  const allTracks = [...CURATED, ...wishTracks];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const fresh = await fetchWishes();
      const freshWishTracks: Track[] = fresh.map((e) => {
        const raw = e.song!.trim();
        const dashIdx = raw.indexOf(" – ");
        const artist = dashIdx > 0 ? raw.slice(0, dashIdx) : raw;
        const title  = dashIdx > 0 ? raw.slice(dashIdx + 3) : "";
        return { key: `w${e.id}`, label: "♥", artist, title: title || artist, wishBy: e.name };
      });
      const text = buildPlaylistText([...CURATED, ...freshWishTracks]);
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

  return (
    <section style={{ background: "var(--bg-page)", padding: "4rem 1.5rem 5rem" }}>
      <style>{`
        .pl-wrap { max-width: 760px; margin: 0 auto; }
        .pl-label { display: inline-block; font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--amber); opacity: 0.85; margin-bottom: 1rem; }
        .pl-heading { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 700; font-size: clamp(1.8rem, 5vw, 2.8rem); color: var(--warm); line-height: 1.15; margin-bottom: 1.2rem; }
        .pl-intro { font-family: 'Lora', serif; font-size: 1rem; line-height: 1.8; color: var(--fg-80); margin-bottom: 2.5rem; max-width: 60ch; }
        .pl-intro em { font-style: italic; color: var(--amber); }

        .pl-count { font-family: 'Lora', serif; font-style: italic; font-size: 0.88rem; color: var(--fg-55); margin-bottom: 1.5rem; }
        .pl-count strong { color: var(--amber); font-style: normal; font-weight: 600; }

        .pl-list { display: flex; flex-direction: column; }
        .pl-row { display: flex; align-items: baseline; gap: 0.9rem; padding: 0.6rem 0; border-bottom: 1px solid var(--fg-06); }
        .pl-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-decade { font-family: 'Lora', serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber); opacity: 0.65; min-width: 3.6rem; flex-shrink: 0; line-height: 1.6; }
        .pl-decade-wish { color: var(--amber); opacity: 0.5; font-size: 0.82rem; }
        .pl-note { font-size: 0.82rem; color: var(--amber); opacity: 0.5; flex-shrink: 0; }
        .pl-song-text { font-family: 'Lora', serif; font-size: 0.95rem; color: var(--fg-88); line-height: 1.5; flex: 1; }
        .pl-song-text strong { font-weight: 600; color: var(--warm); }
        .pl-wish-by { display: inline; font-style: italic; font-size: 0.82rem; color: var(--fg-45); margin-left: 0.4rem; }

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
          zusammengestellt von uns — und von euch.
        </p>

        <p className="pl-count">
          Aktuell <strong>{allTracks.length} Songs</strong> — {wishTracks.length === 0
            ? "noch keine Community-Wünsche eingegangen"
            : `davon ${wishTracks.length} ${wishTracks.length === 1 ? "Wunsch" : "Wünsche"} von euch`}.
        </p>

        <div className="pl-list">
          {allTracks.map((t) => (
            <div key={t.key} className="pl-row">
              <span className="pl-decade">
                {t.label === "♥"
                  ? <span className="pl-decade-wish">♥</span>
                  : t.label}
              </span>
              <span className="pl-note">♪</span>
              <span className="pl-song-text">
                <strong>{t.artist}</strong>
                {t.title && ` – ${t.title}`}
                {t.wishBy && <span className="pl-wish-by">— Wunsch von {t.wishBy}</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="pl-download-wrap">
          <p className="pl-download-info">
            Komplette Playlist als Textdatei — immer auf dem aktuellen Stand, inklusive aller Wünsche.
          </p>
          <button className="pl-dl-btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? "Wird geladen …" : `↓ Playlist herunterladen (${allTracks.length} Songs)`}
          </button>
          <p className="pl-cta">
            Dein Song fehlt? Beim <a href="#anmeldung">Anmelden</a> eintragen — dann direkt erneut herunterladen.
          </p>
        </div>
      </div>
    </section>
  );
}
