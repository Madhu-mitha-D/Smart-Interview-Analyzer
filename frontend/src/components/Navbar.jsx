import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

const NAV_LINKS = [
  { to: "/",           label: "Home",      key: "home" },
  { to: "/dashboard",  label: "Dashboard", key: "dashboard" },
  { to: "/interview",  label: "Interview", key: "interview" },
  { to: "/insights",   label: "Insights",  key: "insights" },
  { to: "/analytics",  label: "Analytics", key: "analytics" },
  { to: "/profile",    label: "Profile",   key: "profile" },
];

/* ── Animated hamburger/X toggle (header-2 style) ─────────── */
function MenuToggleIcon({ open }) {
  return (
    <svg
      strokeWidth={2.5}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 32 32"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      style={{
        transform: open ? "rotate(-45deg)" : "rotate(0deg)",
        transition: "transform 300ms ease-in-out",
      }}
    >
      <path
        style={{
          strokeDasharray: open ? "20 300" : "12 63",
          strokeDashoffset: open ? "-32.42px" : "0",
          transition: "stroke-dasharray 300ms, stroke-dashoffset 300ms",
        }}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  );
}

export default function Navbar({ title = "Home" }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  // Scroll detection — header-2 style (shrinks + floats on scroll)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      if (y <= 16) { setVisible(true); }
      else if (y > lastY.current + 8) { setVisible(false); setOpen(false); }
      else if (y < lastY.current - 8) { setVisible(true); }
      lastY.current = y;
    };
    lastY.current = window.scrollY;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const activeKey = NAV_LINKS.find(l =>
    l.key === "home" ? loc.pathname === "/" : loc.pathname.startsWith(l.to)
  )?.key;

  return (
    <>
      {/* ── Floating pill navbar ───────────────────────────── */}
      <motion.header
        animate={{ y: visible ? 0 : -90, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center"
        style={{ paddingTop: scrolled ? 12 : 20, paddingLeft: 16, paddingRight: 16 }}
      >
        <nav
          className="w-full transition-all duration-300 ease-out"
          style={{
            maxWidth: scrolled ? 840 : 1080,
            borderRadius: 999,
            border: "1px solid",
            borderColor: scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
            background: scrolled
              ? "rgba(5,5,18,0.92)"
              : "rgba(5,5,18,0.5)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,95,255,0.08)" : "none",
          }}
        >
          <div
            className="flex items-center justify-between gap-3 transition-all duration-300"
            style={{ padding: scrolled ? "8px 16px" : "10px 20px" }}
          >
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setOpen(false)}>
              <div
                className="rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 transition-all duration-300"
                style={{
                  width: scrolled ? 30 : 34,
                  height: scrolled ? 30 : 34,
                  borderRadius: scrolled ? 10 : 12,
                  background: "linear-gradient(135deg, #6d5fff 0%, #00e5cc 100%)",
                  boxShadow: "0 0 16px rgba(109,95,255,0.5)",
                }}
              >
                <span className="text-[10px] font-black text-white tracking-tight select-none">SI</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <span
                className="font-bold text-white/90 transition-all duration-300 hidden sm:block"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: scrolled ? 13 : 14,
                  letterSpacing: "-0.2px",
                }}
              >
                Smart Interview
              </span>
            </Link>

            {/* Desktop links */}
            {isAuthed && (
              <div className="hidden md:flex items-center">
                {NAV_LINKS.map((link) => {
                  const isActive = activeKey === link.key;
                  return (
                    <Link
                      key={link.key}
                      to={link.to}
                      className="relative px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150"
                      style={{
                        color: isActive ? "#fff" : "rgba(237,237,245,0.52)",
                        background: isActive ? "rgba(109,95,255,0.18)" : "transparent",
                        border: isActive ? "1px solid rgba(109,95,255,0.4)" : "1px solid transparent",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(237,237,245,0.88)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(237,237,245,0.52)"; }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              {isAuthed ? (
                <>
                  {/* Page indicator pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.03]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "navPing 2.2s ease-in-out infinite" }} />
                    <span className="text-[10px] text-white/35 font-mono uppercase tracking-widest">{title}</span>
                  </div>

                  <button
                    onClick={logout}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/[0.09] bg-white/[0.04] text-[13px] text-white/60 font-medium hover:bg-white/[0.09] hover:text-white/90 transition-all"
                  >
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3 h-3">
                      <path d="M5 13H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h3"/>
                      <path d="M10 10l3-3-3-3"/>
                      <path d="M13 7H5"/>
                    </svg>
                    Logout
                  </button>

                  {/* Mobile burger */}
                  <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/[0.1] bg-white/[0.05] text-white/70 hover:text-white transition-colors"
                  >
                    <MenuToggleIcon open={open} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-full border border-white/[0.09] bg-white/[0.04] text-[13px] text-white/75 font-medium hover:bg-white/[0.08] hover:text-white transition-all">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full text-[13px] font-bold text-white btn-shimmer transition-all"
                    style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 16px rgba(109,95,255,0.3)" }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </motion.header>

      {/* ── Mobile menu drawer ─────────────────────────────── */}
      <AnimatePresence>
        {open && isAuthed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(3,3,10,0.9)", backdropFilter: "blur(16px)" }}
          >
            {/* Spacer for navbar */}
            <div style={{ height: 72 }} />

            <motion.div
              initial={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex h-full w-full flex-col justify-between gap-2 p-5 overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive = activeKey === link.key;
                  return (
                    <Link
                      key={link.key}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all"
                      style={{
                        background: isActive ? "rgba(109,95,255,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isActive ? "rgba(109,95,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? "#fff" : "rgba(237,237,245,0.6)",
                      }}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }} />}
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pb-8">
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full py-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/65"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes navPing {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>
    </>
  );
}
