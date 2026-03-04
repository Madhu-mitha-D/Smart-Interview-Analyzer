import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Navbar from "./Navbar";

function NoiseLayer() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.08] mix-blend-overlay"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"140\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"140\" height=\"140\" filter=\"url(%23n)\" opacity=\"0.55\"/></svg>')",
      }}
    />
  );
}

function GridLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 opacity-[0.08]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(60% 60% at 50% 35%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(60% 60% at 50% 35%, black 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function PremiumBackground() {
  // Spotlight follows mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.2 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.2 });

  useEffect(() => {
    const onMove = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-black" />

      {/* blobs */}
      <motion.div
        className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 25, 0], opacity: [0.25, 0.38, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 60%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute -bottom-56 -right-56 h-[760px] w-[760px] rounded-full blur-3xl"
        animate={{ x: [0, -35, 0], y: [0, -25, 0], opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 60%, transparent 70%)",
        }}
      />

      {/* spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 600px at var(--x) var(--y), rgba(255,255,255,0.10), transparent 60%)",
          "--x": sx,
          "--y": sy,
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% 20%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 900px at 50% 90%, rgba(255,255,255,0.05), transparent 60%)",
        }}
      />

      <GridLayer />
      <NoiseLayer />
    </div>
  );
}

export default function Layout() {
  const location = useLocation();

  const routeTitle = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/interview")) return "Interview";
    if (p.startsWith("/insights")) return "Insights";
    if (p.startsWith("/analytics")) return "Analytics";
    if (p.startsWith("/login")) return "Login";
    if (p.startsWith("/register")) return "Register";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-white">
      <PremiumBackground />
      <Navbar title={routeTitle} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="py-6 sm:py-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}