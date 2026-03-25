export default function Hero() {
  return (
    <section
      id="start"
      className="hero-grain relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(38 60% 18% / 0.35) 0%, hsl(220 18% 7%) 65%), hsl(220 18% 7%)",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(38 88% 54% / 0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl">
          <h1
            className="font-serif font-bold leading-none tracking-tight gold-glow"
            style={{ fontSize: "clamp(3.2rem, 10vw, 8rem)", color: "hsl(40 25% 92%)" }}
          >
            EMMERICH
            <br />
            <span style={{ color: "var(--gold)" }}>BOOMT!</span>
          </h1>
          <p className="mt-5 text-xl md:text-2xl font-medium" style={{ color: "hsl(38 80% 68%)" }}>
            Die Boomer-Party des Sommers.
          </p>
          <p className="mt-4 text-sm md:text-base" style={{ color: "hsl(40 15% 58%)" }}>
            18. Juli 2026 · Kapaunenberg / Am Bölt · geschlossene Gesellschaft
          </p>
          <p className="mt-8 text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: "hsl(40 20% 72%)" }}>
            Was als Schnapsidee begann, wird jetzt eine richtige Sommerparty:
            ein Abend mit Musik, Wiedersehen, Tanz, Gesprächen, guter Stimmung
            und genau der richtigen Portion Nostalgie.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#anmeldung"
              className="inline-flex items-center px-6 py-3 rounded text-sm font-semibold transition-all duration-200"
              style={{ background: "var(--gold)", color: "hsl(220 18% 7%)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "hsl(38 88% 62%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gold)")}
            >
              Jetzt anmelden
            </a>
            <a
              href="#event"
              className="inline-flex items-center px-6 py-3 rounded text-sm font-semibold border transition-all duration-200"
              style={{ borderColor: "hsl(38 88% 54% / 0.4)", color: "hsl(40 25% 80%)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)";
                (e.currentTarget as HTMLElement).style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(38 88% 54% / 0.4)";
                (e.currentTarget as HTMLElement).style.color = "hsl(40 25% 80%)";
              }}
            >
              Mehr erfahren
            </a>
          </div>
          <p className="mt-12 text-sm md:text-base italic" style={{ color: "hsl(40 15% 50%)" }}>
            Nicht geschniegelt. Nicht überinszeniert. Einfach ein verdammt geiler Abend.
          </p>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(220 18% 7%))" }}
      />
    </section>
  );
}
