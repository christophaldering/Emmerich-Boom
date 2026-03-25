export default function Hero() {
  return (
    <section
      id="start"
      className="hero-grain relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background: "hsl(268 45% 7%)",
      }}
    >
      {/* Disco-era multi-glow background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 90% 70% at 15% 20%, hsl(318 72% 38% / 0.35) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 85% 80%, hsl(282 68% 42% / 0.30) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 60% 10%, hsl(38 95% 50% / 0.18) 0%, transparent 50%), hsl(268 45% 7%)",
      }} />

      {/* Warm spotlight from top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center top, hsl(318 72% 55% / 0.15) 0%, hsl(282 68% 50% / 0.08) 40%, transparent 70%)",
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl">
          <h1
            className="font-serif font-bold leading-none tracking-tight"
            style={{
              fontSize: "clamp(3.2rem, 10vw, 8rem)",
              color: "hsl(42 30% 92%)",
              textShadow: "0 0 40px hsl(318 72% 55% / 0.4), 0 0 80px hsl(282 68% 55% / 0.2)",
            }}
          >
            EMMERICH
            <br />
            <span style={{
              color: "var(--gold)",
              textShadow: "0 0 30px hsl(38 95% 58% / 0.5), 0 0 60px hsl(38 95% 58% / 0.2)",
            }}>
              BOOMT!
            </span>
          </h1>

          <p className="mt-5 text-xl md:text-2xl font-medium" style={{ color: "hsl(318 60% 78%)" }}>
            Die Boomer-Party des Sommers.
          </p>

          <p className="mt-4 text-sm md:text-base" style={{ color: "hsl(268 30% 62%)" }}>
            18. Juli 2026 · Kapaunenberg / Am Bölt · geschlossene Gesellschaft
          </p>

          <p className="mt-8 text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: "hsl(42 20% 74%)" }}>
            Was als Schnapsidee begann, wird jetzt eine richtige Sommerparty:
            ein Abend mit Musik, Wiedersehen, Tanz, Gesprächen, guter Stimmung
            und genau der richtigen Portion Nostalgie.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#anmeldung"
              className="inline-flex items-center px-6 py-3 rounded text-sm font-semibold transition-all duration-200"
              style={{ background: "var(--gold)", color: "hsl(268 45% 7%)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "hsl(38 95% 66%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold)")}
            >
              Jetzt anmelden
            </a>
            <a
              href="#event"
              className="inline-flex items-center px-6 py-3 rounded text-sm font-semibold border transition-all duration-200"
              style={{ borderColor: "hsl(318 72% 55% / 0.5)", color: "hsl(42 30% 84%)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--magenta)";
                (e.currentTarget as HTMLElement).style.color = "var(--magenta)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(318 72% 55% / 0.5)";
                (e.currentTarget as HTMLElement).style.color = "hsl(42 30% 84%)";
              }}
            >
              Mehr erfahren
            </a>
          </div>

          <p className="mt-12 text-sm md:text-base italic" style={{ color: "hsl(268 25% 52%)" }}>
            Nicht geschniegelt. Nicht überinszeniert. Einfach ein verdammt geiler Abend.
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(268 45% 7%))" }}
      />
    </section>
  );
}
