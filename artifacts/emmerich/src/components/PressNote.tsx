import { useReveal } from "@/hooks/useReveal";

export default function PressNote() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem 4rem" }}
    >
      <div
        className="reveal"
        style={{
          background: "rgba(245,232,200,0.04)",
          border: "1px solid rgba(245,232,200,0.14)",
          borderRadius: "4px",
          padding: "1.4rem 1.6rem",
          fontSize: "0.88rem",
          lineHeight: 1.8,
          color: "rgba(245,232,200,0.65)",
          fontStyle: "italic",
        }}
      >
        <style>{`
          .pressnote strong {
            color: rgba(245,232,200,0.85);
            font-style: normal;
          }
        `}</style>
        <span className="pressnote">
          <strong>Für Redaktionen und Multiplikatoren:</strong> „Emmerich boomt!" ist eine ehrenamtlich organisierte Bürgerveranstaltung. Ein kleines, unbezahltes Orga-Team aus Emmerich plant diesen Abend in seiner Freizeit — mit Herzblut, ohne Förderung, und mit der Überzeugung, dass solche Abende das leisten, was keine App der Welt kann: echte Begegnung. Wir freuen uns über jede Unterstützung.
        </span>
      </div>
    </section>
  );
}
