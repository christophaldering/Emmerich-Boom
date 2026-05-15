import Poster from "@/components/Poster";
import Letter from "@/components/Letter";
import Fakten from "@/components/Fakten";
import Countdown from "@/components/Countdown";
import PressNote from "@/components/PressNote";
import Legal from "@/components/Legal";
import SiteFooter from "@/components/SiteFooter";
import ThemeToggle from "@/components/ThemeToggle";

export default function BoomerPartyPage() {
  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100svh" }}>
      <ThemeToggle />
      <Poster />
      <Letter />
      <Fakten />
      <Countdown />
      <PressNote />
      <Legal />
      <SiteFooter />
    </main>
  );
}
