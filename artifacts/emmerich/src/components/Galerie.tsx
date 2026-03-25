import { useReveal } from "@/hooks/useReveal";

const placeholders = [
  { label: "Vorbereitungen", hue: 290 },
  { label: "Partyabend 2026", hue: 318 },
  { label: "Weitere Treffen", hue: 300 },
  { label: "Partyabend 2026", hue: 278 },
  { label: "Vorbereitungen", hue: 308 },
];

export default function Galerie() {
  const ref = useReveal();
  return (
    <section id="galerie" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 45% 7%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(42 30% 90%)" }}>
            Boomer-Momente
          </h2>
        </div>
        <div className="reveal reveal-delay-1 max-w-2xl mb-10 text-base md:text-lg leading-relaxed" style={{ color: "hsl(42 20% 68%)" }}>
          Aus einer losen Idee ist längst mehr geworden.
          Hier entstehen nach und nach die Bilder dazu: Eindrücke vergangener Treffen, Vorfreude auf den Abend und später natürlich die schönsten Momente von Emmerich boomt!
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          {/* Real photo – OrgaTeam Kickoff, spans 2 columns */}
          <div
            className="reveal col-span-2 relative rounded-lg overflow-hidden border group cursor-pointer transition-all duration-300"
            style={{
              borderColor: "hsl(268 40% 28%)",
              minHeight: "220px",
              boxShadow: "0 0 0 1px hsl(318 72% 40% / 0.1)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(318 60% 45% / 0.55)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(268 40% 28%)")}
          >
            <img
              src="/images/orgateam-kickoff.jpeg"
              alt="Das OrgaTeam beim ersten Treffen"
              className="w-full h-full object-cover"
              style={{ minHeight: "220px", maxHeight: "340px" }}
            />
            {/* Gradient overlay bottom */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, hsl(268 45% 5% / 0.85) 0%, hsl(268 45% 5% / 0.2) 40%, transparent 70%)",
              }}
            />
            {/* Subtle magenta tint on hover */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "hsl(318 60% 40% / 0.06)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10">
              <span className="block text-sm font-semibold" style={{ color: "hsl(42 30% 88%)" }}>
                Das OrgaTeam – Kickoff-Treffen
              </span>
              <span className="block text-xs mt-0.5" style={{ color: "hsl(268 25% 58%)" }}>
                Der Anfang von allem
              </span>
            </div>
          </div>

          {/* Placeholder tiles */}
          {placeholders.map((p, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} relative rounded-lg overflow-hidden border flex items-end cursor-pointer transition-all duration-300 group`}
              style={{
                background: `hsl(${p.hue} 35% 11%)`,
                borderColor: `hsl(${p.hue} 28% 22%)`,
                minHeight: "150px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = `hsl(${p.hue} 60% 50% / 0.5)`)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = `hsl(${p.hue} 28% 22%)`)
              }
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 40% 40%, hsl(${p.hue} 60% 40% / 0.12) 0%, transparent 65%)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `hsl(${p.hue} 60% 50% / 0.06)` }}
              />
              <div
                className="relative z-10 w-full px-3 py-3"
                style={{ background: `linear-gradient(to top, hsl(${p.hue} 45% 6% / 0.90), transparent)` }}
              >
                <span className="text-xs font-medium" style={{ color: "hsl(42 25% 72%)" }}>
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
