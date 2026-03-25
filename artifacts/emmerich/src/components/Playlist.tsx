import { useReveal } from "@/hooks/useReveal";

const tags = ["Disco & Dancefloor", "80er / 90er", "Rock & Klassiker", "Mitsingen garantiert"];

export default function Playlist() {
  const ref = useReveal();
  return (
    <section id="playlist" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 40% 9%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Der Sound des Abends
          </h2>
        </div>

        <div className="reveal reveal-delay-1 max-w-2xl mb-10 text-base md:text-lg leading-relaxed" style={{ color: "hsl(40 20% 68%)" }}>
          Zwischen Tanzfläche, Mitsingmoment und lässigem Sommerbeat.
          Die Playlist für Emmerich boomt! wird Stück für Stück wachsen — irgendwo zwischen Klassikern, Kultsongs und genau den Titeln, bei denen man sofort wieder da ist.
        </div>

        <div className="reveal reveal-delay-2 flex flex-wrap gap-3 mb-10">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                background: "hsl(268 38% 13%)",
                borderColor: "hsl(282 60% 55% / 0.4)",
                color: "hsl(318 60% 75%)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spotify-embed placeholder – leicht erweiterbar */}
        <div
          className="reveal reveal-delay-3 rounded-lg border flex items-center justify-center"
          style={{
            background: "hsl(268 35% 11%)",
            borderColor: "hsl(268 28% 22%)",
            minHeight: "120px",
          }}
        >
          <p className="text-sm italic text-center px-6" style={{ color: "hsl(40 15% 45%)" }}>
            Playlist folgt — Spotify-Embed kann hier eingebettet werden.
          </p>
        </div>

        <p className="reveal reveal-delay-4 mt-6 text-sm italic" style={{ color: "hsl(40 15% 48%)" }}>
          Die Musik kennen wir noch. Die Texte meistens auch.
        </p>
      </div>
    </section>
  );
}
