import { useState, useEffect } from "react";
import BoomerPartyPage from "@/pages/BoomerPartyPage";
import AdminPage from "@/pages/AdminPage";
import TicketUebersichtPage from "@/pages/TicketUebersichtPage";
import TicketPage from "@/pages/TicketPage";
import AnmeldungTicketsPage from "@/pages/AnmeldungTicketsPage";
import EinlassPage from "@/pages/EinlassPage";
import PlakatPage from "@/pages/PlakatPage";
import PlakatPrintPage from "@/pages/PlakatPrintPage";
import FlyerPage from "@/pages/FlyerPage";
import FlyerPrintPage from "@/pages/FlyerPrintPage";
import AnmeldungPage from "@/pages/AnmeldungPage";
import TicketDemoPage from "@/pages/TicketDemoPage";
import ProgrammPage from "@/pages/ProgrammPage";
import ThekePage from "@/pages/ThekePage";
import ThekeWandPage from "@/pages/ThekeWandPage";
import Beacon from "@/components/Beacon";

function NachrueckerAbgelehntPage() {
  const A = "#E8991A";
  return (
    <div style={{ background: "#0A0704", minHeight: "100svh", color: "#F5E8C8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "560px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(1.5rem, 5vw, 2.2rem)", color: A, marginBottom: "1.5rem", lineHeight: 1.25 }}>
          Alles klar — kein Stress.
        </p>
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1rem", lineHeight: 1.8, color: "rgba(245,232,200,0.75)", marginBottom: "2rem" }}>
          Du hast abgelehnt. Der Platz geht an jemand anderen weiter.<br />
          Wir wünschen dir trotzdem einen guten Sommer.
        </p>
        <button
          onClick={() => { window.history.pushState({}, "", `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`); window.dispatchEvent(new PopStateEvent("popstate")); }}
          style={{ background: "transparent", border: `1px solid ${A}`, borderRadius: "4px", color: A, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "1rem", padding: "0.75rem 2rem", cursor: "pointer" }}
        >
          Zur Startseite
        </button>
      </div>
    </div>
  );
}

const ADMIN_SLUG = "boomer-orga-intern";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getRoute(): { page: string; param?: string } {
  const path = window.location.pathname;
  const stripped = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const clean = stripped.replace(/^\/+|\/+$/g, "");

  if (clean === ADMIN_SLUG) return { page: "admin" };
  if (clean === "einlass") return { page: "einlass" };
  if (clean === `${ADMIN_SLUG}/einlass`) return { page: "einlass" };
  if (clean === `${ADMIN_SLUG}/tickets`) return { page: "ticket-uebersicht" };
  if (clean === "plakat") return { page: "plakat" };
  if (clean === "plakat-print") return { page: "plakat-print" };
  if (clean === "flyer") return { page: "flyer" };
  if (clean === "flyer-print") return { page: "flyer-print" };
  if (clean === "anmeldung") return { page: "anmeldung" };
  if (clean === "ticket-demo") return { page: "ticket-demo" };
  if (clean === "programm") return { page: "programm" };
  if (clean === "nachruecker/abgelehnt") return { page: "nachruecker-abgelehnt" };
  if (clean === "theke/wand") return { page: "theke-wand" };
  if (clean === "theke") return { page: "theke" };
  const ticketOverviewMatch = clean.match(new RegExp(`^${ADMIN_SLUG}/ticket/([A-Fa-f0-9]{16})/alle$`));
  if (ticketOverviewMatch) return { page: "anmeldung-tickets", param: ticketOverviewMatch[1].toUpperCase() };
  const ticketMatch = clean.match(new RegExp(`^${ADMIN_SLUG}/ticket/([A-Fa-f0-9]{16})$`));
  if (ticketMatch) return { page: "ticket", param: ticketMatch[1].toUpperCase() };
  return { page: "main" };
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRoute(getRoute());
    const onPop = () => {
      window.scrollTo(0, 0);
      setRoute(getRoute());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (route.page === "admin") return <AdminPage />;
  if (route.page === "ticket-uebersicht") return <TicketUebersichtPage />;
  if (route.page === "einlass") return <EinlassPage />;
  if (route.page === "plakat") return <PlakatPage />;
  if (route.page === "plakat-print") return <PlakatPrintPage />;
  if (route.page === "flyer") return <FlyerPage />;
  if (route.page === "flyer-print") return <FlyerPrintPage />;
  if (route.page === "ticket" && route.param) return <TicketPage code={route.param} />;
  if (route.page === "anmeldung-tickets" && route.param) return <AnmeldungTicketsPage code={route.param} />;
  if (route.page === "anmeldung") return <AnmeldungPage />;
  if (route.page === "nachruecker-abgelehnt") return <NachrueckerAbgelehntPage />;
  if (route.page === "ticket-demo") return <TicketDemoPage />;
  if (route.page === "programm") return <ProgrammPage />;
  if (route.page === "theke") return <ThekePage />;
  if (route.page === "theke-wand") return <ThekeWandPage />;

  return (
    <>
      <Beacon />
      <BoomerPartyPage />
    </>
  );
}
