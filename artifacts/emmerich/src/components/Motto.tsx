export default function Motto() {
  return (
    <section aria-hidden="true" style={{ textAlign: "center", padding: "4rem 2rem 3rem", maxWidth: "480px", margin: "0 auto" }}>
      <style>{`
        .motto-line {
          display: block;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          font-size: clamp(1.7rem, 5vw, 2.6rem);
          line-height: 1.35;
          color: var(--warm);
          opacity: 0;
          transform: translateY(12px);
          animation: mottoFade 0.7s ease forwards;
        }
        .motto-line:nth-child(1) { animation-delay: 0.1s; }
        .motto-line:nth-child(2) { animation-delay: 0.3s; color: var(--amber); }
        .motto-line:nth-child(3) { animation-delay: 0.5s; }
        @keyframes mottoFade { to { opacity: 1; transform: none; } }
        .motto-rule {
          width: 2.5rem;
          height: 1px;
          background: var(--amber-35);
          margin: 1.5rem auto;
        }
      `}</style>

      <div className="motto-rule" />
      <span className="motto-line">Von uns.</span>
      <span className="motto-line">Für uns.</span>
      <span className="motto-line">Wird Zeit.</span>
      <div className="motto-rule" />
    </section>
  );
}
