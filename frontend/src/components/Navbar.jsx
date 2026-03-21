import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
      <rect x="3" y="13" width="7" height="8" rx="1.5" />
    </svg>
  );
}

function InterviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5C7 13.4 6 11.6 6 9.5A6 6 0 0 1 18 9.5c0 2.1-1 3.9-2.5 5" />
      <path d="M9 14h6" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20v-12" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[18px] w-[18px]">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[16px] w-[16px]">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function NavIconPill({ to, label, icon, active, hovered, onHover, onLeave }) {
  const expanded = hovered || active;

  return (
    <Link to={to} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <motion.div
        initial={false}
        animate={{ width: expanded ? 138 : 44 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={[
          "flex h-10 items-center overflow-hidden rounded-full border px-3",
          active
            ? "border-white/15 bg-white/[0.08] text-white"
            : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:text-white",
        ].join(" ")}
      >
        <div className="flex min-w-[18px] items-center justify-center">{icon}</div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.12 }}
              className="ml-3 whitespace-nowrap text-sm"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export default function Navbar({ title = "Home" }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [hoveredItem, setHoveredItem] = useState("");
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 16) {
        setShowNav(true);
      } else if (currentY > lastScrollY.current + 6) {
        setShowNav(false);
      } else if (currentY < lastScrollY.current - 6) {
        setShowNav(true);
      }

      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = loc.pathname === "/";
  const isDashboard = loc.pathname.startsWith("/dashboard");
  const isInterview = loc.pathname.startsWith("/interview");
  const isInsights = loc.pathname.startsWith("/insights");
  const isAnalytics = loc.pathname.startsWith("/analytics");
  const isProfile = loc.pathname.startsWith("/profile");

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: showNav ? 0 : -100, opacity: showNav ? 1 : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="sticky top-0 z-50"
    >
      <div className="border-b border-white/8 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div id="navbar-brand-anchor" className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/12 bg-white/[0.05]">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white">
                SIA
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Smart Interview Analyzer</p>
              <p className="truncate text-xs text-white/38">{title}</p>
            </div>
          </div>

          {isAuthed ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 lg:flex">
                <NavIconPill
                  to="/"
                  label="Home"
                  icon={<HomeIcon />}
                  active={isHome}
                  hovered={hoveredItem === "home"}
                  onHover={() => setHoveredItem("home")}
                  onLeave={() => setHoveredItem("")}
                />
                <NavIconPill
                  to="/dashboard"
                  label="Dashboard"
                  icon={<DashboardIcon />}
                  active={isDashboard}
                  hovered={hoveredItem === "dashboard"}
                  onHover={() => setHoveredItem("dashboard")}
                  onLeave={() => setHoveredItem("")}
                />
                <NavIconPill
                  to="/interview"
                  label="Interview"
                  icon={<InterviewIcon />}
                  active={isInterview}
                  hovered={hoveredItem === "interview"}
                  onHover={() => setHoveredItem("interview")}
                  onLeave={() => setHoveredItem("")}
                />
                <NavIconPill
                  to="/insights"
                  label="Insights"
                  icon={<InsightsIcon />}
                  active={isInsights}
                  hovered={hoveredItem === "insights"}
                  onHover={() => setHoveredItem("insights")}
                  onLeave={() => setHoveredItem("")}
                />
                <NavIconPill
                  to="/analytics"
                  label="Analytics"
                  icon={<AnalyticsIcon />}
                  active={isAnalytics}
                  hovered={hoveredItem === "analytics"}
                  onHover={() => setHoveredItem("analytics")}
                  onLeave={() => setHoveredItem("")}
                />
                <NavIconPill
                  to="/profile"
                  label="Profile"
                  icon={<ProfileIcon />}
                  active={isProfile}
                  hovered={hoveredItem === "profile"}
                  onHover={() => setHoveredItem("profile")}
                  onLeave={() => setHoveredItem("")}
                />
              </div>

              <button
                onClick={logout}
                className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.03]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}