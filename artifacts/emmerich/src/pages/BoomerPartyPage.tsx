import Poster from "@/components/Poster";
import Letter from "@/components/Letter";
import Motto from "@/components/Motto";
import Fakten from "@/components/Fakten";
import Countdown from "@/components/Countdown";
import Teilnehmer from "@/components/Teilnehmer";
import KaI from "@/components/KaI";
import Playlist from "@/components/Playlist";
import BoomerClub from "@/components/BoomerClub";
import DruckMaterial from "@/components/DruckMaterial";
import PressNote from "@/components/PressNote";
import Legal from "@/components/Legal";
import SiteFooter from "@/components/SiteFooter";
import StimmungsBild from "@/components/StimmungsBild";
import AnmeldeAufruf from "@/components/AnmeldeAufruf";
import Phase2Aufruf from "@/components/Phase2Aufruf";
import AnmeldungFortschritt from "@/components/AnmeldungFortschritt";
import Formular from "@/components/Formular";
import TicketsTeaser from "@/components/TicketsTeaser";
import Stempel from "@/components/Stempel";
import Hymne from "@/components/Hymne";
import StickyHymnePlayer from "@/components/StickyHymnePlayer";
import { HymneAudioProvider } from "@/contexts/HymneAudioContext";

export default function BoomerPartyPage() {
  return (
    <HymneAudioProvider>
      <main style={{ background: "var(--bg-page)", minHeight: "100svh" }}>
        <Poster />
        <AnmeldungFortschritt />
        <AnmeldeAufruf />
        <Phase2Aufruf />
        <Hymne />
        <Letter />
        <Motto />
        <StimmungsBild />
        <Fakten />
        <Countdown />
        <Teilnehmer />
        <TicketsTeaser />
        <Stempel />
        <Playlist />
        <KaI refreshSignal={0} />
        <Formular />
        <BoomerClub />
        <DruckMaterial />
        <PressNote />
        <Legal />
        <SiteFooter />
        <StickyHymnePlayer />
      </main>
    </HymneAudioProvider>
  );
}
