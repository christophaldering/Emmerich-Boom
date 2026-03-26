import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(268 45% 7%)", color: "hsl(42 20% 82%)" }}
    >
      {/* Top nav bar */}
      <header
        className="w-full px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "hsl(268 30% 14%)" }}
      >
        <span className="font-serif font-bold text-lg" style={{ color: "hsl(42 30% 90%)" }}>
          Emmerich
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <div className="max-w-xl w-full">
          {/* Glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "600px",
              height: "400px",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(ellipse at center, hsl(318 72% 38% / 0.18) 0%, hsl(282 68% 30% / 0.10) 50%, transparent 75%)",
              filter: "blur(20px)",
            }}
          />

          <h1
            className="font-serif font-bold relative z-10"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
              color: "hsl(42 30% 92%)",
              textShadow: "0 0 40px hsl(318 72% 55% / 0.3)",
            }}
          >
            Willkommen
          </h1>

          <p className="mt-4 text-base md:text-lg leading-relaxed relative z-10" style={{ color: "hsl(268 20% 60%)" }}>
            Diese Seite ist im Aufbau.
          </p>

          {/* Event card – Boomer Party */}
          <div className="mt-12 relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "hsl(268 25% 50%)" }}>
              Aktuelle Veranstaltung
            </p>
            <Link href="/boomer-party">
              <div
                className="group rounded-xl border p-6 cursor-pointer transition-all duration-300 text-left"
                style={{
                  background: "hsl(268 40% 9%)",
                  borderColor: "hsl(268 30% 20%)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(318 60% 45% / 0.6)";
                  (e.currentTarget as HTMLElement).style.background = "hsl(268 40% 11%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(268 30% 20%)";
                  (e.currentTarget as HTMLElement).style.background = "hsl(268 40% 9%)";
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "hsl(318 55% 65%)" }}>
                      18. Juli 2026 · Kapaunenberg / Am Bölt
                    </p>
                    <h2
                      className="font-serif font-bold text-2xl md:text-3xl"
                      style={{ color: "var(--gold)" }}
                    >
                      EMMERICH BOOMT!
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: "hsl(268 20% 56%)" }}>
                      Die Boomer-Party des Sommers — Musik, Wiedersehen, Nostalgie.
                    </p>
                  </div>
                  <span
                    className="shrink-0 mt-1 text-xl transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "hsl(318 60% 55%)" }}
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: "hsl(268 20% 38%)" }}>
        © 2026 Emmerich
      </footer>
    </div>
  );
}
