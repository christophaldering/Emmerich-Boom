export default function BoomerClub() {
  return (
    <section style={{ maxWidth: "640px", margin: "0 auto", padding: "1rem 2rem 4rem" }}>
      <style>{`
        .boomerclub-wrap {
          background: var(--fg-04);
          border: 1px solid var(--amber-20);
          border-radius: 6px;
          padding: 2rem 1.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          text-align: center;
        }
        .boomerclub-label {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.75rem;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.80;
        }
        .boomerclub-heading {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: clamp(1.3rem, 4vw, 1.7rem);
          color: var(--warm);
          line-height: 1.25;
        }
        .boomerclub-text {
          font-family: 'Lora', serif;
          font-size: 1rem;
          line-height: 1.8;
          color: var(--fg-88);
          max-width: 44ch;
        }
        .boomerclub-qr {
          width: min(200px, 55vw);
          height: auto;
          border-radius: 8px;
          background: #fff;
          padding: 10px;
          display: block;
        }
        .boomerclub-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: #25D366;
          color: #fff;
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 1rem;
          font-weight: 500;
          padding: 0.85rem 1.6rem;
          border-radius: 4px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .boomerclub-btn:hover { background: #1ebe5b; transform: translateY(-1px); }
        .boomerclub-btn:active { transform: none; }
        .boomerclub-qr-details { width: 100%; text-align: center; }
        .boomerclub-qr-details summary { list-style: none; cursor: pointer; }
        .boomerclub-qr-details summary::-webkit-details-marker { display: none; }
        .boomerclub-qr-hint {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.88rem;
          color: var(--fg-55);
          line-height: 1.6;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--fg-25);
        }
      `}</style>

      <div className="boomerclub-wrap">
        <span className="boomerclub-label">Community</span>
        <h3 className="boomerclub-heading">Der Boomerclub Emmerich</h3>
        <p className="boomerclub-text">
          2024 entstand der Boomerclub an der Theke der Societät — in bester Bierlaune, wie es sich gehört.
          Seitdem sind rund <strong style={{ color: "var(--warm)" }}>190 Leute</strong> dabei.
          Manche kommen zu den gemütlichen Treffen — die finden alle vier bis sechs Monate statt, etwa dreimal im Jahr. Andere verfolgen einfach, was so passiert — direkt über WhatsApp. Beides ist vollkommen richtig.
          Passt doch.
        </p>
        <p className="boomerclub-text" style={{ marginTop: "-0.4rem" }}>
          Wer möchte, ist herzlich willkommen — einfach auf den Button tippen und dazukommen.
        </p>
        <a href="https://chat.whatsapp.com/Ie7Jo01K44H8BREFq4XuIV?mode=gi_t" target="_blank" rel="noopener noreferrer" className="boomerclub-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.118 1.524 5.845L.057 23.272a.75.75 0 0 0 .921.921l5.427-1.467A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.524-5.205-1.433l-.373-.22-3.865 1.045 1.045-3.865-.22-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Zur WhatsApp-Gruppe beitreten
        </a>
        <details className="boomerclub-qr-details">
          <summary className="boomerclub-qr-hint">Lieber QR-Code scannen?</summary>
          <img src="/boomerclub-whatsapp-qr.png" alt="QR-Code zum Beitreten der Boomerclub-Emmerich-WhatsApp-Gruppe" className="boomerclub-qr" style={{ marginTop: "1rem" }} />
        </details>
      </div>
    </section>
  );
}
