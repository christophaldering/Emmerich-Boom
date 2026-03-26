import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ueber from "@/components/Ueber";
import DasEvent from "@/components/DasEvent";
import WasErwartet from "@/components/WasErwartet";
import Playlist from "@/components/Playlist";
import Galerie from "@/components/Galerie";
import Countdown from "@/components/Countdown";
import FAQ from "@/components/FAQ";
import Sponsoren from "@/components/Sponsoren";
import Anmeldung from "@/components/Anmeldung";
import Footer from "@/components/Footer";

function BoomerPartyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Ueber />
        <DasEvent />
        <WasErwartet />
        <Playlist />
        <Galerie />
        <Countdown />
        <FAQ />
        <Sponsoren />
        <Anmeldung />
      </main>
      <Footer />
    </div>
  );
}

export default BoomerPartyPage;
