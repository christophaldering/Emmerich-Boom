const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const IMG_SRC = `${BASE}/images/ticket-teaser.jpg`;

export default function TicketsTeaser() {
  return (
    <section
      style={{
        background: "#0A0704",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "12px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#E8991A",
          margin: "0 0 12px",
        }}
      >
        DEMNÄCHST
      </p>

      {/* Headline */}
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "32px",
          fontWeight: 500,
          color: "#F5E8C8",
          margin: "0 0 24px",
          lineHeight: 1.2,
        }}
      >
        Die Tickets sind in der Mache.
      </h2>

      {/* Bild */}
      <img
        src={IMG_SRC}
        alt="Vorder- und Rückseite der Boomerparty-Tickets auf einem Holztisch"
        style={{
          display: "block",
          width: "90%",
          maxWidth: "800px",
          height: "auto",
          borderRadius: "6px",
        }}
      />

      {/* Untertext */}
      <p
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "16px",
          fontStyle: "italic",
          color: "rgba(245,232,200,0.7)",
          margin: "24px 0 0",
        }}
      >
        Mehr verraten wir noch nicht — bis bald.
      </p>
    </section>
  );
}
