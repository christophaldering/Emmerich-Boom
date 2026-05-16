export default function StimmungsBild() {
  return (
    <section style={{ position: "relative", marginBottom: "0" }}>
      <div style={{ position: "relative", overflow: "hidden", maxHeight: "60svh" }}>
        <img
          src="/images/stimmungsbild.jpeg"
          alt="70er, 80er, 90er — die Ära"
          style={{
            width: "100%",
            height: "60svh",
            objectFit: "cover",
            objectPosition: "center 25%",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,7,4,0.15) 0%, rgba(10,7,4,0.0) 40%, rgba(10,7,4,0.85) 100%)",
          }}
        />
      </div>

      <div
        style={{
          background: "#0A0704",
          textAlign: "center",
          padding: "2rem 1rem 3.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 3vw, 1.45rem)",
            color: "rgba(245,232,200,0.6)",
            margin: 0,
            letterSpacing: "0.04em",
          }}
        >
          70er. 80er. 90er. Bölt.
        </p>
      </div>
    </section>
  );
}
