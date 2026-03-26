import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import BeamBackground from "./BeamBackground";
import AppNavbar from "./AppNavbar";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();

  const showFooter =
    location.pathname === "/" || location.pathname.startsWith("/profile");

  return (
    <div className="relative min-h-screen text-white">
      <BeamBackground />
      <div className="grain" />

      <div className="relative z-10">
        <AppNavbar />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="mx-auto max-w-7xl px-5 pt-8 pb-10 sm:px-7"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {showFooter && <Footer />}
      </div>
    </div>
  );
}