import { useRef, useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AnmeldeButton() {
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const h =
          entry.borderBoxSize?.[0]?.blockSize ??
          entry.contentRect.height;
        setBarHeight(h);
      }
    });
    ro.observe(el);
    setBarHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {/* In-flow spacer — matches actual bar height so content never hides behind it */}
      <div aria-hidden style={{ height: barHeight, flexShrink: 0 }} />

      {/* Fixed bar */}
      <div
        ref={barRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "0.55rem 1rem",
          background: "rgba(10,7,4,0.93)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(232,153,26,0.30)",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.82rem",
            color: "rgba(245,232,200,0.6)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Phase-1-Eintrag zählt nicht mehr — hier neu anmelden
        </span>
        <a
          href={`${BASE}/anmeldung`}
          style={{
            display: "inline-block",
            background: "#E8991A",
            color: "#0A0704",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "0.88rem",
            letterSpacing: "0.04em",
            padding: "0.4rem 1.1rem",
            borderRadius: "3px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Jetzt verbindlich anmelden →
        </a>
      </div>
    </>
  );
}
