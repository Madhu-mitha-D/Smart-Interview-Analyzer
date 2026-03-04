import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function NavPill({ to, label, active }) {
  return (
    <Link
      to={to}
      className={[
        "px-3 py-2 rounded-xl text-sm transition border",
        active
          ? "bg-white/10 border-white/20 text-white"
          : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Navbar({ title = "Dashboard" }) {
  const nav = useNavigate();
  const loc = useLocation();

  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  // ✅ Fix: dashboard should be active ONLY on "/"
  const isDashboard = loc.pathname === "/";
  const isInterview = loc.pathname.startsWith("/interview");
  const isInsights = loc.pathname.startsWith("/insights");
  const isAnalytics = loc.pathname.startsWith("/analytics");

  return (
    <div className="sticky top-0 z-40">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="border-b border-white/10 bg-black/40 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-2xl border border-white/12 bg-white/6 grid place-items-center">
              <span className="text-sm font-semibold">SIA</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white/60">Smart Interview Analyzer</p>
              <p className="text-base font-semibold truncate">{title}</p>
            </div>
          </div>

          {isAuthed ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <NavPill to="/" label="Dashboard" active={isDashboard} />
                <NavPill to="/interview" label="Interview" active={isInterview} />
                <NavPill to="/insights" label="Insights" active={isInsights} />
                <NavPill to="/analytics" label="Analytics" active={isAnalytics} />
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm rounded-xl bg-white text-black font-medium hover:scale-[1.03] transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}