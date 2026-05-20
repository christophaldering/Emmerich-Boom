import Erfolgsektion from "@/components/Erfolgsektion";

export default function TicketDemoPage() {
  return (
    <div style={{ minHeight: "100svh", background: "#0A0704" }}>
      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: "0.75rem",
        letterSpacing: "0.15em",
        color: "rgba(232,153,26,0.35)",
        textTransform: "uppercase",
        textAlign: "center",
        paddingTop: "2rem",
        margin: 0,
      }}>
        Ticket-Vorschau · Demo
      </p>

      <Erfolgsektion
        anzahl={3}
        personen={["Christoph Aldering", "Erika Mustermann", "Hans-Werner Böhm"]}
        ticket_nummern={[1, 2, 3]}
        ticket_codes={["A1B2C3D4E5F6G7H8", "B2C3D4E5F6G7H8A1", "C3D4E5F6G7H8A1B2"]}
      />
    </div>
  );
}
