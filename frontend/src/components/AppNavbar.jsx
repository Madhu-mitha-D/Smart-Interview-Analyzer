import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  MessagesSquare,
  Lightbulb,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview", label: "Interview", icon: MessagesSquare },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

function NavItem({ to, label, compact = false, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
            : "text-white/65 hover:bg-white/[0.06] hover:text-white",
          compact ? "w-full text-left" : "",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <motion.div
          animate={{
            maxWidth: scrolled ? 1120 : 1280,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={[
            "mx-auto flex items-center justify-between gap-3 transition-all duration-200",
            scrolled
              ? "rounded-full border border-white/12 bg-[#141416]/70 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              : "bg-transparent px-1 py-2 border border-transparent shadow-none backdrop-blur-0",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={[
                "flex items-center gap-3 transition-all",
                scrolled
                  ? "rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 hover:bg-white/[0.08]"
                  : "rounded-full px-1 py-1 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center text-white transition-all",
                  scrolled
                    ? "rounded-full border border-white/12 bg-white/[0.06]"
                    : "rounded-full",
                ].join(" ")}
              >
                <LayoutDashboard className="h-4 w-4" />
              </div>

              <div className="hidden min-[900px]:block">
                <p className="text-sm font-semibold text-white">
                  Smart Interview
                </p>
                <p className="text-[10px] text-white/35">
                  Performance Analyzer
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className={[
                "hidden text-sm font-medium transition lg:inline-flex",
                scrolled
                  ? "rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-white/75 hover:bg-white/[0.1] hover:text-white"
                  : "rounded-full px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white",
              ].join(" ")}
            >
              Sign Out
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={[
                "inline-flex h-10 w-10 items-center justify-center text-white/75 transition hover:text-white lg:hidden",
                scrolled
                  ? "rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.1]"
                  : "rounded-full hover:bg-white/[0.06]",
              ].join(" ")}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-20 z-50 rounded-[28px] border border-white/10 bg-[#141416]/88 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <div key={item.to} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-white/45" />
                    <div className="flex-1">
                      <NavItem
                        to={item.to}
                        label={item.label}
                        compact
                        onClick={() => setMobileOpen(false)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}