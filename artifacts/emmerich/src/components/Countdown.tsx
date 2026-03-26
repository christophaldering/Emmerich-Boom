import { useState, useEffect } from "react";
import { useReveal } from "@/hooks/useReveal";

const TARGET = new Date('2026-07-18T19:00:00');

function getTimeLeft() {
  const diff = TARGET.getTime() - new Date().getTime();
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: "clamp(2.2rem,6vw,3.5rem)",
          color: "var(--amber)",
          lineHeight: 1,
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.7rem",
          color: "var(--dimmer)",
          marginTop: "0.2rem",
        }}
      >
        {label}
      </span>
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
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 2rem 4rem" }}
    >
      <div
        className="reveal"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2rem",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <Unit value={time.days} label="Tage" />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            color: "rgba(232,153,26,0.3)",
            alignSelf: "center",
          }}
        >·</span>
        <Unit value={time.hours} label="Stunden" />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            color: "rgba(232,153,26,0.3)",
            alignSelf: "center",
          }}
        >·</span>
        <Unit value={time.minutes} label="Minuten" />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            color: "rgba(232,153,26,0.3)",
            alignSelf: "center",
          }}
        >·</span>
        <Unit value={time.seconds} label="Sekunden" />
      </div>
    </section>
  );
}
