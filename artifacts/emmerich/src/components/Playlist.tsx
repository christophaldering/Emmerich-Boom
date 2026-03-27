import { useState, useEffect } from "react";

interface PlaylistProps {
  refreshKey?: number;
}

type Entry = {
  id: number;
  name: string;
  song: string | null;
};

const CURATED: { decade: string; artist: string; title: string }[] = [
  { decade: "70er", artist: "ABBA", title: "Dancing Queen" },
  { decade: "70er", artist: "Earth, Wind & Fire", title: "September" },
  { decade: "70er", artist: "Queen", title: "Bohemian Rhapsody" },
  { decade: "70er", artist: "Boney M.", title: "Rivers of Babylon" },
  { decade: "70er", artist: "Gloria Gaynor", title: "I Will Survive" },
  { decade: "80er", artist: "Duran Duran", title: "Rio" },
  { decade: "80er", artist: "Nena", title: "99 Luftballons" },
  { decade: "80er", artist: "a-ha", title: "Take On Me" },
  { decade: "80er", artist: "Toto", title: "Africa" },
  { decade: "80er", artist: "Depeche Mode", title: "Personal Jesus" },
  { decade: "80er", artist: "Cyndi Lauper", title: "Girls Just Want to Have Fun" },
  { decade: "90er", artist: "Haddaway", title: "What Is Love" },
  { decade: "90er", artist: "Snap!", title: "Rhythm Is a Dancer" },
  { decade: "90er", artist: "Die Fantastischen Vier", title: "Die Da" },
  { decade: "2000er", artist: "Amy Winehouse", title: "Rehab" },
  { decade: "2010er", artist: "Mark Ronson ft. Bruno Mars", title: "Uptown Funk" },
  { decade: "2010er", artist: "Pharrell Williams", title: "Happy" },
  { decade: "2020er", artist: "Dua Lipa", title: "Levitating" },
  { decade: "2020er", artist: "Harry Styles", title: "As It Was" },
];

function pad(s: string, width: number) {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

function buildPlaylistText(wishes: Entry[]): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const sep = "─".repeat(50);

  const lines: string[] = [
    "EMMERICH BOOMT! — Die Playlist",
    "Boomer-Party · Samstag, 18. Juli 2026 · Bölt (Kapaunenberg)",
    `Stand: ${dateStr}`,
    sep,
    "",
    "KURATORISCHE STARTLISTE",
    "",
    ...CURATED.map((s) => `${pad("[" + s.decade + "]", 9)}  ${s.artist} – ${s.title}`),
  ];

  if (wishes.length > 0) {
    lines.push("");
    lines.push(sep);
    lines.push("");
    lines.push("EURE WÜNSCHE");
    lines.push("");
    wishes.forEach((e) => {
      lines.push(`${e.name} wünscht sich: ${e.song}`);
    });
  }

  const total = CURATED.length + wishes.length;
  lines.push("");
  lines.push(sep);
  lines.push(`Insgesamt: ${total} Songs · emmerich-boomt.replit.app`);

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const freshWishes = await fetchWishes();
      const text = buildPlaylistText(freshWishes);
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

  const totalCount = CURATED.length + wishes.length;

  return (
    <section style={{ background: "var(--bg-page)", padding: "4rem 1.5rem 5rem" }}>
      <style>{`
        .pl-wrap { max-width: 760px; margin: 0 auto; }
        .pl-label { display: inline-block; font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--amber); opacity: 0.85; margin-bottom: 1rem; }
        .pl-heading { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 700; font-size: clamp(1.8rem, 5vw, 2.8rem); color: var(--warm); line-height: 1.15; margin-bottom: 1.2rem; }
        .pl-intro { font-family: 'Lora', serif; font-size: 1rem; line-height: 1.8; color: var(--fg-80); margin-bottom: 3rem; max-width: 60ch; }
        .pl-intro em { font-style: italic; color: var(--amber); }
        .pl-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, var(--amber), transparent); margin: 2.5rem 0; opacity: 0.35; }

        .pl-sub { font-family: 'Lora', serif; font-style: italic; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--amber-55); margin-bottom: 1.2rem; }

        .pl-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 0; }
        .pl-row { display: flex; align-items: center; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px solid var(--fg-06); }
        .pl-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-decade { font-family: 'Lora', serif; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--amber); opacity: 0.7; min-width: 3.8rem; flex-shrink: 0; }
        .pl-note { font-size: 0.85rem; color: var(--amber); opacity: 0.55; flex-shrink: 0; }
        .pl-song-text { font-family: 'Lora', serif; font-size: 0.95rem; color: var(--fg-88); line-height: 1.4; flex: 1; }
        .pl-song-text strong { font-weight: 600; color: var(--warm); }

        .pl-wishes { display: flex; flex-direction: column; gap: 0; margin-bottom: 0; }
        .pl-wish-row { display: flex; align-items: center; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px solid var(--fg-06); }
        .pl-wish-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-wish-who { font-family: 'Lora', serif; font-style: italic; font-size: 0.88rem; color: var(--fg-55); }
        .pl-wish-song { font-family: 'Lora', serif; font-size: 0.95rem; color: var(--fg-88); line-height: 1.5; flex: 1; }

        .pl-download-wrap { margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid var(--fg-08); display: flex; flex-direction: column; gap: 0.6rem; align-items: flex-start; }
        .pl-download-label { font-family: 'Lora', serif; font-style: italic; font-size: 0.9rem; color: var(--fg-55); line-height: 1.6; }
        .pl-download-label strong { color: var(--amber); font-style: normal; font-weight: 600; }
        .pl-dl-btn { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Playfair Display', serif; font-style: italic; font-size: 1rem; color: var(--amber); background: transparent; border: 1px solid var(--amber); border-radius: 3px; padding: 0.75rem 1.4rem; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .pl-dl-btn:hover:not(:disabled) { background: var(--amber); color: var(--black); }
        .pl-dl-btn:disabled { opacity: 0.5; cursor: default; }

        .pl-cta { margin-top: 1.5rem; font-family: 'Lora', serif; font-style: italic; font-size: 0.9rem; color: var(--fg-45); line-height: 1.7; }
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

        <p className="pl-sub">Startliste — kuratorisch</p>
        <div className="pl-list">
          {CURATED.map((s, i) => (
            <div key={i} className="pl-row">
              <span className="pl-decade">{s.decade}</span>
              <span className="pl-note">♪</span>
              <span className="pl-song-text"><strong>{s.artist}</strong> – {s.title}</span>
            </div>
          ))}
        </div>

        {wishes.length > 0 && (
          <>
            <div className="pl-divider" />
            <p className="pl-sub">Eure Wünsche — bereits eingegangen</p>
            <div className="pl-wishes">
              {wishes.map((e) => (
                <div key={e.id} className="pl-wish-row">
                  <span className="pl-note">♪</span>
                  <span className="pl-wish-song">
                    <span className="pl-wish-who">{e.name} wünscht sich:</span>{" "}{e.song}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pl-download-wrap">
          <p className="pl-download-label">
            Aktuelle Playlist mit allen Einträgen als Textdatei —{" "}
            <strong>immer auf dem neuesten Stand</strong>, inklusive aller Wünsche die bis zum Klick eingegangen sind.
          </p>
          <button
            className="pl-dl-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Wird geladen …" : `↓ Playlist herunterladen (${totalCount} Songs)`}
          </button>
          <p className="pl-cta">
            Dein Song fehlt noch? Einfach beim{" "}
            <a href="#anmeldung">Anmelden</a> eintragen — dann direkt erneut herunterladen.
          </p>
        </div>
      </div>
    </section>
  );
}
