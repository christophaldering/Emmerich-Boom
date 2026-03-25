import { useReveal } from "@/hooks/useReveal";

export default function Ueber() {
  const ref = useReveal();
  return (
    <section id="ueber" ref={ref} className="py-20 md:py-28" style={{ background: "hsl(268 45% 7%)" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="reveal max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6" style={{ color: "hsl(40 25% 90%)" }}>
            Aus einer Idee wird ein Sommerabend
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "hsl(40 20% 68%)" }}>
            Die Boomer-Gruppe in Emmerich ist aus einer spontanen Idee entstanden — und daraus wurde schnell mehr: lockere Treffen, bekannte Gesichter, neue Begegnungen und jedes Mal die gleiche Erkenntnis:
            Das funktioniert. Und es macht Spaß.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: "hsl(40 20% 68%)" }}>
            Mit „Emmerich boomt!" wird daraus nun ein größeres Format:
            eine Boomer-Party als geschlossene Veranstaltung — mit Anmeldung, Musik, Fingerfood und allem, was einen richtig guten Sommerabend ausmacht.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Wiedersehen", icon: "✦", delay: "reveal-delay-1" },
            { label: "Musik", icon: "♪", delay: "reveal-delay-2" },
            { label: "Sommernacht", icon: "◐", delay: "reveal-delay-3" },
          ].map((item) => (
            <div
              key={item.label}
              className={`reveal ${item.delay} rounded-lg p-8 text-center border`}
              style={{
                background: "hsl(268 35% 11%)",
                borderColor: "hsl(268 28% 22%)",
              }}
            >
              <div className="text-3xl mb-4" style={{ color: "var(--gold)" }}>
                {item.icon}
              </div>
              <p className="text-base font-semibold" style={{ color: "hsl(40 25% 80%)" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
