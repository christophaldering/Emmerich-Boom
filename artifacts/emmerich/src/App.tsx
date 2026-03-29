import { useState, useEffect } from "react";
import BoomerPartyPage from "@/pages/BoomerPartyPage";
import AdminPage from "@/pages/AdminPage";
import TicketPage from "@/pages/TicketPage";
import EinlassPage from "@/pages/EinlassPage";
import PlakatPage from "@/pages/PlakatPage";
import PlakatPageB from "@/pages/PlakatPageB";
import PlakatPageC from "@/pages/PlakatPageC";
import FlyerPage from "@/pages/FlyerPage";
import Beacon from "@/components/Beacon";

const ADMIN_SLUG = "boomer-orga-intern";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getRoute(): { page: string; param?: string } {
  const path = window.location.pathname;
  const stripped = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const clean = stripped.replace(/^\/+/, "");

  if (clean === ADMIN_SLUG) return { page: "admin" };
  if (clean === `${ADMIN_SLUG}/einlass`) return { page: "einlass" };
  if (clean === "plakat") return { page: "plakat" };
  if (clean === "plakat-b") return { page: "plakat-b" };
  if (clean === "plakat-c") return { page: "plakat-c" };
  if (clean === "flyer") return { page: "flyer" };
  const ticketMatch = clean.match(new RegExp(`^${ADMIN_SLUG}/ticket/([A-Fa-f0-9]{16})$`));
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
  if (route.page === "plakat") return <PlakatPageWithNotice />;
  if (route.page === "plakat-b") return <PlakatPageB />;
  if (route.page === "plakat-c") return <PlakatPageC />;
  if (route.page === "flyer") return <FlyerPage />;
  if (route.page === "ticket" && route.param) return <TicketPage code={route.param} />;

  return (
    <>
      <Beacon />
      <BoomerPartyPage />
    </>
  );
}

function PlakatPageWithNotice() {
  return (
    <>
      <div className="no-print" style={{
        background: "#1a0e05",
        borderBottom: "2px solid #e8991a",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        flexWrap: "wrap",
        fontFamily: "'Lora', serif",
        fontStyle: "italic",
        fontSize: "0.85rem",
        color: "rgba(245,232,200,0.7)",
      }}>
        <span>Weitere Plakat-Varianten zum Vergleich:</span>
        <a
          href="/plakat-b"
          style={{
            color: "#e8991a",
            fontWeight: 700,
            textDecoration: "none",
            padding: "0.25rem 0.75rem",
            border: "1px solid #e8991a",
            borderRadius: "3px",
          }}
        >
          Variante B – Retro-Stil
        </a>
        <a
          href="/plakat-c"
          style={{
            color: "#e8991a",
            fontWeight: 700,
            textDecoration: "none",
            padding: "0.25rem 0.75rem",
            border: "1px solid #e8991a",
            borderRadius: "3px",
          }}
        >
          Variante C – Modern &amp; Edgy
        </a>
      </div>
      <PlakatPage />
    </>
  );
}
