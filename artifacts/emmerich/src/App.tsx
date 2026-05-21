import { useState, useEffect } from "react";
import BoomerPartyPage from "@/pages/BoomerPartyPage";
import AdminPage from "@/pages/AdminPage";
import TicketUebersichtPage from "@/pages/TicketUebersichtPage";
import TicketPage from "@/pages/TicketPage";
import EinlassPage from "@/pages/EinlassPage";
import PlakatPage from "@/pages/PlakatPage";
import PlakatPrintPage from "@/pages/PlakatPrintPage";
import FlyerPage from "@/pages/FlyerPage";
import FlyerPrintPage from "@/pages/FlyerPrintPage";
import AnmeldungPage from "@/pages/AnmeldungPage";
import TicketDemoPage from "@/pages/TicketDemoPage";
import ProgrammPage from "@/pages/ProgrammPage";
import Beacon from "@/components/Beacon";

const ADMIN_SLUG = "boomer-orga-intern";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getRoute(): { page: string; param?: string } {
  const path = window.location.pathname;
  const stripped = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const clean = stripped.replace(/^\/+/, "");

  if (clean === ADMIN_SLUG) return { page: "admin" };
  if (clean === `${ADMIN_SLUG}/einlass`) return { page: "einlass" };
  if (clean === `${ADMIN_SLUG}/tickets`) return { page: "ticket-uebersicht" };
  if (clean === "plakat") return { page: "plakat" };
  if (clean === "plakat-print") return { page: "plakat-print" };
  if (clean === "flyer") return { page: "flyer" };
  if (clean === "flyer-print") return { page: "flyer-print" };
  if (clean === "anmeldung") return { page: "anmeldung" };
  if (clean === "ticket-demo") return { page: "ticket-demo" };
  if (clean === "programm") return { page: "programm" };
  const ticketMatch = clean.match(new RegExp(`^${ADMIN_SLUG}/ticket/([A-Fa-f0-9]{16})$`));
  if (ticketMatch) return { page: "ticket", param: ticketMatch[1].toUpperCase() };
  return { page: "main" };
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    setRoute(getRoute());
    const onPop = () => setRoute(getRoute());
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
  if (route.page === "anmeldung") return <AnmeldungPage />;
  if (route.page === "ticket-demo") return <TicketDemoPage />;
  if (route.page === "programm") return <ProgrammPage />;

  return (
    <>
      <Beacon />
      <BoomerPartyPage />
    </>
  );
}
