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

export default function AnmeldungPage() {
  const [erfolg, setErfolg] = useState<{ anzahl: number; bezahlweg: string } | null>(null);
  const erfolgsRef = useRef<HTMLDivElement>(null);

  const handleSuccess = (data: { anzahl: number; bezahlweg: string }) => {
    setErfolg(data);
    setTimeout(() => {
      erfolgsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100svh", color: "var(--warm)" }}>
      <Poster />
      <AnmeldungBrief />
      <DreiZeilen />
      <FaktenPhase2 />
      <Countdown />

      {erfolg ? (
        <div ref={erfolgsRef}>
          <Erfolgsektion anzahl={erfolg.anzahl} bezahlweg={erfolg.bezahlweg} />
        </div>
      ) : (
        <Anmeldeformular onSuccess={handleSuccess} />
      )}

      <PressNote />
      <LegalPhase2 />
    </div>
  );
}
