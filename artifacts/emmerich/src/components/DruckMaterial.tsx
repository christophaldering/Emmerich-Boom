import { useReveal } from "@/hooks/useReveal";

export default function DruckMaterial() {
  const ref = useReveal();

  return (
    <section ref={ref} style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 4rem" }}>
      <style>{`
        .druckmaterial-wrap {
          background: var(--fg-04);
          border: 1px solid var(--amber-20);
          border-radius: 6px;
          padding: 1.4rem 1.8rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .druckmaterial-header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .druckmaterial-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.80;
        }
        .druckmaterial-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: var(--warm);
          line-height: 1.3;
          margin: 0;
        }
        .druckmaterial-text {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.92rem;
          line-height: 1.7;
          color: var(--fg-78);
          margin: 0;
        }
        .druckmaterial-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .druckmaterial-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--amber-20);
          border-radius: 4px;
          color: var(--amber);
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.6rem 1.2rem;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.15s;
          cursor: pointer;
        }
        .druckmaterial-btn:hover {
          background: var(--amber-20);
          border-color: var(--amber);
          color: var(--warm);
        }
        .druckmaterial-btn svg {
          opacity: 0.75;
          flex-shrink: 0;
        }
      `}</style>

      <div className="druckmaterial-wrap reveal">
        <div className="druckmaterial-header">
          <span className="druckmaterial-label">Werbematerial</span>
          <h3 className="druckmaterial-heading">Plakat & Flyer zum Ausdrucken</h3>
        </div>
        <p className="druckmaterial-text">
          Helft mit und hängt ein Plakat aus oder legt Flyer aus — alles fertig zum Drucken, direkt im Browser.
        </p>
        <div className="druckmaterial-links">
          <a href="/plakat" target="_blank" rel="noopener noreferrer" className="druckmaterial-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Plakat drucken
          </a>
          <a href="/flyer" target="_blank" rel="noopener noreferrer" className="druckmaterial-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Flyer drucken
          </a>
        </div>
      </div>
    </section>
  );
}
