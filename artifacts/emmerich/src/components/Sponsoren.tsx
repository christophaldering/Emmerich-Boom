import { useReveal } from "@/hooks/useReveal";

const partner = [
  "Location / Gastgeber",
  "Unterstützer",
  "Partner",
  "Technik / Musik",
];

export default function Sponsoren() {
  const ref = useReveal();
  return (
    <section id="partner" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 40% 9%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Mit Unterstützung von
          </h2>
        </div>

        <div className="reveal reveal-delay-1 max-w-2xl mb-12 text-base leading-relaxed" style={{ color: "hsl(40 20% 66%)" }}>
          Damit aus einer guten Idee ein richtig guter Abend wird, braucht es Menschen, die mitziehen.
          Hier werden nach und nach die Partner und Unterstützer sichtbar, die Emmerich boomt! möglich machen.
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partner.map((label, i) => (
            <div
              key={label}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} rounded-lg border flex flex-col items-center justify-center text-center p-8 transition-all duration-200`}
              style={{
                background: "hsl(268 35% 11%)",
                borderColor: "hsl(268 28% 22%)",
                minHeight: "130px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(38 88% 54% / 0.35)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(268 28% 22%)")
              }
            >
              <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center" style={{ background: "hsl(38 88% 54% / 0.1)" }}>
                <span style={{ color: "var(--gold)", fontSize: "1.1rem" }}>✦</span>
              </div>
              <p className="text-xs font-medium" style={{ color: "hsl(40 15% 55%)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
