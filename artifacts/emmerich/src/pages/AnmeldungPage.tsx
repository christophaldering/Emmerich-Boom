import { useState, useRef } from "react";
import Poster from "@/components/Poster";
import Countdown from "@/components/Countdown";
import PressNote from "@/components/PressNote";
import AnmeldungBrief from "@/components/AnmeldungBrief";
import DreiZeilen from "@/components/DreiZeilen";
import FaktenPhase2 from "@/components/FaktenPhase2";
import Anmeldeformular from "@/components/Anmeldeformular";
import Erfolgsektion from "@/components/Erfolgsektion";
import LegalPhase2 from "@/components/LegalPhase2";
import AnmeldungCounter from "@/components/AnmeldungCounter";
import { PHASE2_CONFIG } from "@/config/phase2";
import { HymneAudioProvider } from "@/contexts/HymneAudioContext";

function AnmeldungDemnächst() {
  return (
    <section style={{
      maxWidth: "640px",
      margin: "0 auto",
      padding: "4rem 2rem 6rem",
      textAlign: "center",
    }}>
      <div style={{
        display: "inline-block",
        border: "1px solid rgba(232,153,26,0.35)",
        borderRadius: "6px",
        padding: "2.5rem 2rem",
        background: "rgba(232,153,26,0.04)",
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
          color: "var(--amber)",
          marginBottom: "1rem",
          lineHeight: 1.3,
        }}>
          Anmeldung öffnet in Kürze
        </p>
        <p style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "1rem",
          color: "rgba(245,232,200,0.65)",
          lineHeight: 1.8,
          marginBottom: 0,
        }}>
          Wir stellen gerade die letzten Details fertig —<br />
          Kontoverbindung, Zahlungswege, Anmeldefrist.<br />
          Schaut in den nächsten Tagen nochmal rein.
        </p>
      </div>
    </section>
  );
}

export default function AnmeldungPage() {
  const [erfolg, setErfolg] = useState<{
    anzahl: number;
    personen: string[];
    ticket_nummern: number[];
  } | null>(null);
  const erfolgsRef = useRef<HTMLDivElement>(null);

  const handleSuccess = (data: { anzahl: number; personen: string[]; ticket_nummern: number[] }) => {
    setErfolg(data);
    setTimeout(() => {
      erfolgsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <HymneAudioProvider>
    <div style={{ background: "var(--black)", minHeight: "100svh", color: "var(--warm)" }}>
      <Poster />
      <AnmeldungBrief />
      <DreiZeilen />
      <FaktenPhase2 />
      <Countdown />

      {PHASE2_CONFIG.ANMELDUNG_AKTIV ? (
        <>
          <AnmeldungCounter />
          <Anmeldeformular onSuccess={handleSuccess} />
          {erfolg && (
            <div ref={erfolgsRef}>
              <Erfolgsektion
                anzahl={erfolg.anzahl}
                personen={erfolg.personen}
                ticket_nummern={erfolg.ticket_nummern}
              />
            </div>
          )}
        </>
      ) : (
        <AnmeldungDemnächst />
      )}

      <PressNote />
      <LegalPhase2 />
    </div>
    </HymneAudioProvider>
  );
}
