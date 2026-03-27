import { useState, useEffect } from "react";

type Entry = {
  id: number;
  name: string;
  song: string | null;
};

const CURATED: { decade: string; artist: string; title: string }[] = [
  { decade: "70er", artist: "ABBA", title: "Dancing Queen" },
  { decade: "70er", artist: "Earth, Wind & Fire", title: "September" },
  { decade: "80er", artist: "Duran Duran", title: "Rio" },
  { decade: "80er", artist: "Nena", title: "99 Luftballons" },
  { decade: "80er", artist: "Depeche Mode", title: "Personal Jesus" },
  { decade: "90er", artist: "Haddaway", title: "What Is Love" },
  { decade: "2010er", artist: "Mark Ronson ft. Bruno Mars", title: "Uptown Funk" },
  { decade: "2020er", artist: "Dua Lipa", title: "Levitating" },
  { decade: "2020er", artist: "Harry Styles", title: "As It Was" },
];

export default function Playlist() {
  const [wishes, setWishes] = useState<Entry[]>([]);

  const fetchWishes = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Entry[]) => {
        setWishes(data.filter((e) => e.song && e.song.trim() !== ""));
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchWishes();
    const interval = setInterval(fetchWishes, 30000);
    return () => clearInterval(interval);
  }, []);

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
        .pl-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--fg-06); }
        .pl-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-decade { font-family: 'Lora', serif; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--amber); opacity: 0.7; min-width: 3.8rem; flex-shrink: 0; }
        .pl-note { font-size: 0.9rem; color: var(--amber); opacity: 0.6; flex-shrink: 0; }
        .pl-song-text { font-family: 'Lora', serif; font-size: 0.98rem; color: var(--fg-88); line-height: 1.4; flex: 1; }
        .pl-song-text strong { font-weight: 600; color: var(--warm); }

        .pl-wishes { display: flex; flex-direction: column; gap: 0; margin-bottom: 0; }
        .pl-wish-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--fg-06); }
        .pl-wish-row:first-child { border-top: 1px solid var(--fg-06); }
        .pl-wish-who { font-family: 'Lora', serif; font-style: italic; font-size: 0.82rem; color: var(--fg-55); min-width: 5rem; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 7rem; }
        .pl-wish-song { font-family: 'Lora', serif; font-size: 0.98rem; color: var(--fg-88); line-height: 1.4; flex: 1; }

        .pl-cta { margin-top: 2.5rem; font-family: 'Lora', serif; font-style: italic; font-size: 0.95rem; color: var(--fg-55); line-height: 1.7; }
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
                  <span className="pl-wish-song">{e.song}</span>
                  <span className="pl-wish-who">{e.name} wünscht</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="pl-cta">
          Dein Song fehlt noch? Einfach beim{" "}
          <a href="#anmeldung">Anmelden</a> eintragen — die Playlist wächst mit.
        </p>
      </div>
    </section>
  );
}
