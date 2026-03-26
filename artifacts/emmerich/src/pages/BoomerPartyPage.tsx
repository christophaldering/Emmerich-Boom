import { useState } from "react";
import Poster from "@/components/Poster";
import Letter from "@/components/Letter";
import Fakten from "@/components/Fakten";
import Countdown from "@/components/Countdown";
import Formular from "@/components/Formular";
import Teilnehmer from "@/components/Teilnehmer";
import KiStimmung from "@/components/KiStimmung";
import PressNote from "@/components/PressNote";
import Legal from "@/components/Legal";
import SiteFooter from "@/components/SiteFooter";

export default function BoomerPartyPage() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleFormSuccess = () => {
    setRefreshCounter((c) => c + 1);
  };

  return (
    <main style={{ background: "var(--black)", minHeight: "100svh" }}>
      <Poster />
      <Letter />
      <Teilnehmer refreshKey={refreshCounter} />
      <KiStimmung />
      <Fakten />
      <Countdown />
      <Formular onSuccess={handleFormSuccess} />
      <PressNote />
      <Legal />
      <SiteFooter />
    </main>
  );
}
