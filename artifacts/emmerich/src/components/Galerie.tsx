import { useReveal } from "@/hooks/useReveal";

const placeholders = [
  { label: "Frühere Treffen", aspect: "aspect-square" },
  { label: "Vorbereitungen", aspect: "aspect-video" },
  { label: "Partyabend 2026", aspect: "aspect-square" },
  { label: "Frühere Treffen", aspect: "aspect-video" },
  { label: "Partyabend 2026", aspect: "aspect-square" },
  { label: "Vorbereitungen", aspect: "aspect-square" },
];

export default function Galerie() {
  const ref = useReveal();
  return (
    <section id="galerie" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(220 18% 7%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Boomer-Momente
          </h2>
        </div>

        <div className="reveal reveal-delay-1 max-w-2xl mb-10 text-base md:text-lg leading-relaxed" style={{ color: "hsl(40 20% 68%)" }}>
          Aus einer losen Idee ist längst mehr geworden.
          Hier entstehen nach und nach die Bilder dazu: Eindrücke vergangener Treffen, Vorfreude auf den Abend und später natürlich die schönsten Momente von Emmerich boomt!
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {placeholders.map((p, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} relative rounded-lg overflow-hidden border flex items-end cursor-pointer transition-all duration-300 group`}
              style={{
                background: `hsl(${220 + i * 3} 14% ${10 + i * 1}%)`,
                borderColor: "hsl(220 12% 18%)",
                minHeight: "150px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(38 88% 54% / 0.4)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(220 12% 18%)")
              }
            >
              {/* Retro-gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 8}%, hsl(38 70% 40% / 0.06) 0%, transparent 65%)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "hsl(38 88% 54% / 0.05)" }}
              />
              <div
                className="relative z-10 w-full px-3 py-3"
                style={{
                  background: "linear-gradient(to top, hsl(220 18% 7% / 0.85), transparent)",
                }}
              >
                <span className="text-xs font-medium" style={{ color: "hsl(40 25% 70%)" }}>
                  {p.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
