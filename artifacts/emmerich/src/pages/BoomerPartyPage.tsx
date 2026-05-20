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

export default function BoomerPartyPage() {
  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100svh" }}>
      <Poster />
      <Teilnehmer />
      <AnmeldeAufruf />
      <Letter />
      <Phase2Aufruf />
      <Motto />
      <StimmungsBild />
      <Fakten />
      <Countdown />
      <Playlist />
      <KaI refreshSignal={0} />
      <BoomerClub />
      <DruckMaterial />
      <PressNote />
      <Legal />
      <SiteFooter />
    </main>
  );
}
