import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";

export default function Layout() {
  const location = useLocation();

  const routeTitle = useMemo(() => {
    const p = location.pathname;

    if (p === "/") return "Home";
    if (p.startsWith("/dashboard")) return "Dashboard";
    if (p.startsWith("/interview")) return "Interview";
    if (p.startsWith("/insights")) return "Insights";
    if (p.startsWith("/analytics")) return "Analytics";
    if (p.startsWith("/profile")) return "Profile";
    if (p.startsWith("/login")) return "Login";
    if (p.startsWith("/register")) return "Register";

    return "Home";
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  return (
    <div className="relative min-h-screen text-white">
      {!isHome && <div className="pointer-events-none fixed inset-0 z-0 bg-black" />}

      <div className="relative z-10">
        <Navbar title={routeTitle} />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={isHome ? "" : "mx-auto max-w-7xl px-6 py-10"}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}