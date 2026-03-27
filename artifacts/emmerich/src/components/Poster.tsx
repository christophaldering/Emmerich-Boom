import { useEffect, useState } from "react";

export default function Poster() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section style={{ position: "relative", height: "100svh", overflow: "hidden" }}>
      <img
        src="/images/boomerpartyposter.jpeg"
        alt="Boomer Party Poster"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center center",
          display: "block",
          background: "var(--black)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(10,7,4,0.6) 60%, rgba(10,7,4,0.97) 100%)",
        }}
      />
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        style={{
          position: "absolute",
          bottom: "2.2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem 1rem",
        }}
        aria-label="Nach unten scrollen"
      >
        <span
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "0.75rem",
            color: "rgba(245,232,200,0.45)",
            letterSpacing: "0.15em",
          }}
        >
          weiterlesen
        </span>
        <span
          style={{
            display: "block",
            width: "18px",
            height: "18px",
            borderRight: "1.5px solid rgba(245,232,200,0.3)",
            borderBottom: "1.5px solid rgba(245,232,200,0.3)",
            transform: "rotate(45deg)",
            animation: "bounce 1.6s ease-in-out infinite",
          }}
        />
      </button>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(5px); }
        }
      `}</style>
    </section>
  );
}
