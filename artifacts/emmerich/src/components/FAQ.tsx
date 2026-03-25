import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const faqs = [
  {
    q: "Wer kann kommen?",
    a: "Alle, die sich mit der Boomer-Idee und der Gruppe verbunden fühlen — im Rahmen der geschlossenen Veranstaltung und der Anmeldung.",
  },
  {
    q: "Muss ich mich anmelden?",
    a: "Ja. Die Teilnahme soll verbindlich über eine Voranmeldung laufen.",
  },
  {
    q: "Gibt es eine Abendkasse?",
    a: "Das ist aktuell nicht vorgesehen.",
  },
  {
    q: "Was kostet der Eintritt?",
    a: "10 Euro pro Person.",
  },
  {
    q: "Was ist im Preis enthalten?",
    a: "Musik, Fingerfood und der gemeinsame Rahmen der Veranstaltung.",
  },
  {
    q: "Kann ich jemanden mitbringen?",
    a: "Das sollte an die jeweilige Anmeldelogik gekoppelt werden und kann dort klar geregelt werden.",
  },
  {
    q: "Findet die Veranstaltung bei jedem Wetter statt?",
    a: "Das wird hier später konkret ergänzt.",
  },
  {
    q: "Gibt es feste Sitzplätze?",
    a: "Aktuell eher nicht als klassisches Sitzplatzformat gedacht, sondern als lockere Veranstaltung.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b"
      style={{ borderColor: "hsl(268 28% 22%)" }}
    >
      <button
        className="w-full text-left py-5 flex items-center justify-between gap-4 transition-colors duration-200"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span
          className="text-sm md:text-base font-medium"
          style={{ color: open ? "var(--gold)" : "hsl(40 25% 82%)" }}
        >
          {q}
        </span>
        <span
          className="text-xl shrink-0 transition-transform duration-300"
          style={{
            color: "var(--gold)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "300px" : "0" }}
      >
        <p
          className="pb-5 text-sm md:text-base leading-relaxed"
          style={{ color: "hsl(40 15% 60%)" }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const ref = useReveal();
  return (
    <section id="faq" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 45% 7%)" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="reveal mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: "hsl(40 25% 90%)" }}>
            Noch Fragen?
          </h2>
        </div>
        <div className="reveal reveal-delay-1">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
