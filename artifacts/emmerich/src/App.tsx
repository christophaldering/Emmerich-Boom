import { useState, useEffect } from "react";
import BoomerPartyPage from "@/pages/BoomerPartyPage";
import AdminPage from "@/pages/AdminPage";
import Beacon from "@/components/Beacon";

const ADMIN_SLUG = "boomer-orga-intern";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    setIsAdmin(path === `/${ADMIN_SLUG}` || path.endsWith(`/${ADMIN_SLUG}`));
  }, []);

  if (isAdmin) return <AdminPage />;

  return (
    <>
      <Beacon />
      <BoomerPartyPage />
    </>
  );
}
