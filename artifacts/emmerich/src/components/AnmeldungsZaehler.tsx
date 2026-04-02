import { useState, useEffect } from "react";

const PERSONEN_COUNT: Record<string, number> = {
  "Nur ich": 1, "Wir zwei": 2, "Wir drei": 3,
  "Vier auf einen Streich": 4, "Fünf oder mehr": 5,
};

interface Props { refreshKey?: number; }

export default function AnmeldungsZaehler({ refreshKey = 0 }: Props) {
  const [personen, setPersonen] = useState<number | null>(null);

  const load = () => {
    fetch("/api/interesse", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { personen: string }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setPersonen(data.reduce((s, e) => s + (PERSONEN_COUNT[e.personen] ?? 1), 0));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (refreshKey > 0) load(); }, [refreshKey]);

  if (personen === null) return null;

  return (
    <section style={{
      background: "var(--bg-section)",
      padding: "2.8rem 1.5rem 3rem",
      textAlign: "center",
      position: "relative",
    }}>
      <style>{`
        .az-top-rule {
          width: 48px;
          height: 2px;
          background: var(--amber-40);
          margin: 0 auto 1.6rem;
        }
        .az-pre {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1.05rem;
          color: var(--fg-60);
          line-height: 1.5;
          margin: 0 0 0.5rem;
        }
        .az-number {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          font-size: clamp(4rem, 18vw, 7rem);
          line-height: 1;
          color: var(--amber);
          display: block;
          margin: 0 0 0.4rem;
          letter-spacing: -0.02em;
        }
        .az-post {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1.05rem;
          color: var(--fg-60);
          line-height: 1.7;
          max-width: 480px;
          margin: 0 auto;
        }
        .az-post strong {
          color: var(--fg-80);
          font-weight: 600;
        }
        .az-bottom-rule {
          width: 48px;
          height: 2px;
          background: var(--amber-40);
          margin: 1.6rem auto 0;
        }
      `}</style>

      <div className="az-top-rule" />

      <p className="az-pre">Bisher haben sich schon</p>
      <span className="az-number">{personen}</span>
      <p className="az-post">
        <strong>Boomer</strong> — und solche, die sich so fühlen
        <br />oder einfach mitfeiern wollen — <strong>angemeldet</strong>.
      </p>

      <div className="az-bottom-rule" />
    </section>
  );
}
