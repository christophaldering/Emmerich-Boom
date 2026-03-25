import { useReveal } from "@/hooks/useReveal";

const infos = [
  { label: "Datum", value: "Samstag, 18. Juli 2026" },
  { label: "Ort", value: "Kapaunenberg / Am Bölt, Emmerich" },
  { label: "Format", value: "Geschlossene Gesellschaft" },
  { label: "Eintritt", value: "10 Euro pro Person" },
  { label: "Anmeldung", value: "Verbindlich vorab" },
  { label: "Inklusive", value: "Musik & Fingerfood" },
];

export default function DasEvent() {
  const ref = useReveal();
  return (
    <section id="event" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 40% 9%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Alles auf einen Blick
          </h2>
        </div>

        <div className="reveal reveal-delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infos.map((info) => (
            <div
              key={info.label}
              className="rounded-lg p-6 border transition-all duration-200"
              style={{
                background: "hsl(268 35% 11%)",
                borderColor: "hsl(268 28% 22%)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(38 88% 54% / 0.4)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "hsl(268 28% 22%)")
              }
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
                {info.label}
              </p>
              <p className="text-base font-medium" style={{ color: "hsl(40 25% 84%)" }}>
                {info.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="reveal reveal-delay-2 mt-10 rounded-lg p-6 border-l-2 text-sm md:text-base leading-relaxed"
          style={{
            borderColor: "var(--gold)",
            background: "hsl(268 35% 11%)",
            color: "hsl(40 15% 60%)",
          }}
        >
          Der Abend ist als interne, geschlossene Veranstaltung geplant.
          Das schafft einen klaren Rahmen, macht die Organisation einfacher und sorgt dafür, dass wir uns auf das konzentrieren können, worum es eigentlich geht: einen guten Abend miteinander zu haben.
        </div>
      </div>
    </section>
  );
}
