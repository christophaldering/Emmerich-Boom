import { useState, useEffect } from "react";
import BoomerPartyPage from "@/pages/BoomerPartyPage";
import AdminPage from "@/pages/AdminPage";
import TicketPage from "@/pages/TicketPage";
import EinlassPage from "@/pages/EinlassPage";
import Beacon from "@/components/Beacon";

const ADMIN_SLUG = "boomer-orga-intern";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getRoute(): { page: string; param?: string } {
  const path = window.location.pathname;
  const stripped = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const clean = stripped.replace(/^\/+/, "");

  if (clean === ADMIN_SLUG) return { page: "admin" };
  if (clean === "einlass") return { page: "einlass" };
  const ticketMatch = clean.match(/^ticket\/([A-Fa-f0-9]{16})$/);
  if (ticketMatch) return { page: "ticket", param: ticketMatch[1].toUpperCase() };
  return { page: "main" };
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    setRoute(getRoute());
  }, []);

  if (route.page === "admin") return <AdminPage />;
  if (route.page === "einlass") return <EinlassPage />;
  if (route.page === "ticket" && route.param) return <TicketPage code={route.param} />;

  return (
    <>
      <Beacon />
      <BoomerPartyPage />
    </>
  );
}
