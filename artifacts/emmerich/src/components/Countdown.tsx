import { useState, useEffect } from "react";
import { useReveal } from "@/hooks/useReveal";

const TARGET = new Date("2026-07-18T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-lg flex items-center justify-center font-serif font-bold relative overflow-hidden"
        style={{
          fontSize: "clamp(2.4rem, 7vw, 5rem)",
          width: "clamp(80px, 18vw, 140px)",
          height: "clamp(80px, 18vw, 140px)",
          background: "hsl(268 40% 11%)",
          border: "1px solid hsl(282 50% 30%)",
          color: "hsl(42 30% 92%)",
          textShadow: "0 0 20px hsl(318 72% 55% / 0.5), 0 0 40px hsl(282 68% 55% / 0.3)",
          boxShadow: "0 0 20px hsl(282 68% 50% / 0.15), inset 0 0 20px hsl(318 72% 30% / 0.1)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(318 60% 40% / 0.15) 0%, transparent 60%)"
        }} />
        <span className="relative z-10">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="mt-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(268 25% 55%)" }}>
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <div className="font-serif font-bold self-center" style={{
      fontSize: "clamp(1.5rem, 4vw, 3rem)",
      color: "var(--magenta)",
      marginTop: "-1.5rem",
      textShadow: "0 0 15px hsl(318 72% 55% / 0.6)",
    }}>
      :
    </div>
  );
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft());
  const ref = useReveal();

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="countdown"
      ref={ref}
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: "hsl(268 40% 9%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(318 72% 30% / 0.12) 0%, hsl(282 68% 25% / 0.08) 40%, transparent 70%)",
      }} />
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 text-center">
        <div className="reveal mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(42 30% 90%)" }}>
            Es wird Zeit
          </h2>
        </div>
        <div className="reveal reveal-delay-1 flex justify-center items-start gap-4 md:gap-8 flex-wrap mb-10">
          <Unit value={time.days} label="Tage" />
          <Colon />
          <Unit value={time.hours} label="Stunden" />
          <Colon />
          <Unit value={time.minutes} label="Minuten" />
          <Colon />
          <Unit value={time.seconds} label="Sekunden" />
        </div>
        <p className="reveal reveal-delay-2 text-base md:text-lg mb-2" style={{ color: "hsl(318 60% 72%)" }}>
          Bis Emmerich boomt.
        </p>
        <p className="reveal reveal-delay-3 text-sm" style={{ color: "hsl(268 25% 52%)" }}>
          18. Juli 2026 · Kapaunenberg
        </p>
      </div>
    </section>
  );
}
