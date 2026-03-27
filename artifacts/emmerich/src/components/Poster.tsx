export default function Poster() {
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
          background: "var(--bg-page)",
        }}
      />
    </section>
  );
}
