import Poster from "@/components/Poster";
import Letter from "@/components/Letter";
import Fakten from "@/components/Fakten";
import Countdown from "@/components/Countdown";
import Formular from "@/components/Formular";
import Teilnehmer from "@/components/Teilnehmer";
import PressNote from "@/components/PressNote";
import Legal from "@/components/Legal";
import SiteFooter from "@/components/SiteFooter";

export default function BoomerPartyPage() {
  return (
    <main style={{ background: "var(--black)", minHeight: "100svh" }}>
      <Poster />
      <Letter />
      <Fakten />
      <Countdown />
      <Formular />
      <Teilnehmer />
      <PressNote />
      <Legal />
      <SiteFooter />
    </main>
  );
}
