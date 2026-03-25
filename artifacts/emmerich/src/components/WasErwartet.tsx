import { useReveal } from "@/hooks/useReveal";

const kacheln = [
  "Musik, die man kennt — und hören will",
  "Sommerliche Abendatmosphäre",
  "Fingerfood statt Förmlichkeit",
  "Bekannte Gesichter und neue Gespräche",
  "Tanzen, reden, trinken, lachen",
];

export default function WasErwartet() {
  const ref = useReveal();
  return (
    <section id="was-erwartet" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(220 18% 7%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Kein großes Gedöns. Aber alles, was man braucht.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {kacheln.map((text, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} rounded-lg p-6 border flex items-start gap-3 transition-all duration-200`}
              style={{ background: "hsl(220 15% 10%)", borderColor: "hsl(220 12% 18%)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(38 88% 54% / 0.35)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(220 12% 18%)")
              }
            >
              <span className="mt-0.5 text-base shrink-0" style={{ color: "var(--gold)" }}>✦</span>
              <p className="text-sm md:text-base leading-snug" style={{ color: "hsl(40 20% 74%)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="reveal reveal-delay-3 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: "hsl(40 15% 58%)" }}>
          <p>Kein starres Programm.</p>
          <p>Kein überladenes Event-Konzept.</p>
          <p className="mt-2">
            Sondern genau die richtige Mischung aus Lockerheit, Musik, Begegnung und Sommerabendgefühl.
          </p>
          <p className="mt-4 italic" style={{ color: "hsl(40 15% 48%)" }}>
            Wiedersehen statt Timeline.
          </p>
        </div>
      </div>
    </section>
  );
}
