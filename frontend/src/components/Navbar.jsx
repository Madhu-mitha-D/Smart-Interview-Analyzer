import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useScroll } from "./ui/use-scroll";

const NAV_LINKS = [
  { label: "Home",      href: "/",          icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Dashboard", href: "/dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { label: "Interview", href: "/interview", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "Insights",  href: "/insights",  icon: "M2 20h20M7 20V10M12 20V4M17 20v-6" },
  { label: "Analytics", href: "/analytics", icon: "M18 20V10M12 20V4M6 20v-6" },
  { label: "Profile",   href: "/profile",   icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

function NavIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d={d} />
    </svg>
  );
}

export default function Navbar({ title = "Home" }) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token);

  const isActive = (href) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 mx-auto mt-3 w-[calc(100%-20px)] max-w-5xl transition-all duration-500"
        )}
      >
        {/* Glass pill */}
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden transition-all duration-500",
            scrolled
              ? "border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_0.5px_rgba(109,95,255,0.15)]"
              : "border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
          )}
          style={{ backdropFilter: "blur(24px)", background: scrolled ? "rgba(3,3,10,0.82)" : "rgba(3,3,10,0.55)" }}
        >
          {/* Top shimmer */}
          <div
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent,rgba(109,95,255,0.5),rgba(0,229,204,0.35),transparent)" }}
          />

          <nav className="flex h-[52px] items-center justify-between px-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div
                className="relative w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 16px rgba(109,95,255,0.45)" }}
              >
                <span className="text-[10px] font-black text-white tracking-tight z-10 relative">SI</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              </div>
              <div>
                <p
                  className="text-[13px] font-bold text-white leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Smart Interview
                </p>
                <p className="text-[10px] text-white/35 font-mono uppercase tracking-widest leading-none mt-0.5">
                  {title}
                </p>
              </div>
            </Link>

            {/* Desktop links */}
            {isAuthed && (
              <div className="hidden md:flex items-center gap-0.5">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all duration-200",
                        active
                          ? "text-white"
                          : "text-white/45 hover:text-white/80"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: "rgba(109,95,255,0.18)", border: "1px solid rgba(109,95,255,0.3)" }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <NavIcon d={link.icon} />
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthed ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-white/50 hover:text-white/90 border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12.5px] font-bold text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 20px rgba(109,95,255,0.3)" }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200"
            >
              <div className="flex flex-col gap-[5px] w-4">
                <motion.span
                  animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block h-px bg-white/70 rounded-full origin-center"
                />
                <motion.span
                  animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block h-px bg-white/70 rounded-full"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block h-px bg-white/70 rounded-full origin-center"
                />
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col"
              style={{
                background: "rgba(5,5,15,0.96)",
                backdropFilter: "blur(32px)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }}
                  >
                    <span className="text-[10px] font-black text-white">SI</span>
                  </div>
                  <span className="text-[13px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Smart Interview
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/50 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {isAuthed && NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                    >
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                          active
                            ? "text-white border border-purple-500/30"
                            : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]"
                        )}
                        style={active ? { background: "rgba(109,95,255,0.15)" } : {}}
                      >
                        <NavIcon d={link.icon} />
                        {link.label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }} />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer footer */}
              {isAuthed && (
                <div className="px-4 py-4 border-t border-white/[0.06]">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}