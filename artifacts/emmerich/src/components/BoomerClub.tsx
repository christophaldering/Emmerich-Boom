export default function BoomerClub() {
  return (
    <section
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "1rem 2rem 4rem",
      }}
    >
      <style>{`
        .boomerclub-wrap {
          background: rgba(245,232,200,0.04);
          border: 1px solid rgba(232,153,26,0.20);
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
          color: rgba(245,232,200,0.88);
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
        .boomerclub-qr-hint {
          font-family: 'Lora', serif;
          font-style: italic;
          font-size: 0.88rem;
          color: rgba(245,232,200,0.65);
          line-height: 1.6;
        }
      `}</style>

      <div className="boomerclub-wrap">
        <span className="boomerclub-label">Community</span>

        <h3 className="boomerclub-heading">Der Boomerclub Emmerich</h3>

        <p className="boomerclub-text">
          Hinter der Party steht eine WhatsApp-Gruppe, in der sich Emmericher Boomer schon eine
          Weile zusammenfinden. Wer mag, ist herzlich eingeladen — einfach QR-Code scannen und dazukommen.
        </p>

        <img
          src="/boomerclub-whatsapp-qr.png"
          alt="QR-Code zum Beitreten der Boomerclub-Emmerich-WhatsApp-Gruppe"
          className="boomerclub-qr"
        />

        <p className="boomerclub-qr-hint">
          Kamera auf den Code halten — fertig.
        </p>
      </div>
    </section>
  );
}
