import TicketSVG from "@/components/TicketSVG";

const DEMO_TICKETS = [
  { name: "Christoph Aldering", nummer: 1 },
  { name: "Erika Mustermann", nummer: 2 },
  { name: "Hans-Werner Böhm", nummer: 3 },
];

export default function TicketDemoPage() {
  return (
    <div style={{
      minHeight: "100svh",
      background: "#0A0704",
      padding: "3rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2.5rem",
    }}>
      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: "0.75rem",
        letterSpacing: "0.15em",
        color: "rgba(232,153,26,0.4)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        Ticket-Vorschau · Demo
      </p>

      {DEMO_TICKETS.map(({ name, nummer }) => (
        <div key={nummer} style={{ width: "100%", maxWidth: "780px" }}>
          <TicketSVG name={name} nummer={nummer} />
        </div>
      ))}
    </div>
  );
}
