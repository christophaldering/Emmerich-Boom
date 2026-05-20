import { useState } from "react";
import Poster from "@/components/Poster";
import Letter from "@/components/Letter";
import Motto from "@/components/Motto";
import Fakten from "@/components/Fakten";
import Countdown from "@/components/Countdown";
import Formular from "@/components/Formular";
import Teilnehmer from "@/components/Teilnehmer";
import KaI from "@/components/KaI";
import AnmeldungsZaehler from "@/components/AnmeldungsZaehler";
import Playlist from "@/components/Playlist";
import BoomerClub from "@/components/BoomerClub";
import DruckMaterial from "@/components/DruckMaterial";
import PressNote from "@/components/PressNote";
import Legal from "@/components/Legal";
import SiteFooter from "@/components/SiteFooter";
import TicketsTeaser from "@/components/TicketsTeaser";
import StimmungsBild from "@/components/StimmungsBild";
import AnmeldeAufruf from "@/components/AnmeldeAufruf";

export default function BoomerPartyPage() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const handleFormSuccess = (newId: number) => {
    setRefreshCounter((c) => c + 1);
    if (newId > 0) setHighlightId(newId);
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100svh" }}>
      <Poster />
      <AnmeldeAufruf />
      <AnmeldungsZaehler refreshKey={refreshCounter} />
      <TicketsTeaser />
      <Letter />
      <Motto />
      <StimmungsBild />
      <Fakten />
      <Countdown />
      <Formular onSuccess={handleFormSuccess} />
      <Playlist refreshKey={refreshCounter} highlightId={highlightId} />
      <Teilnehmer refreshKey={refreshCounter} />
      <KaI refreshSignal={refreshCounter} />
      <BoomerClub />
      <DruckMaterial />
      <PressNote />
      <Legal />
      <SiteFooter />
    </main>
  );
}
