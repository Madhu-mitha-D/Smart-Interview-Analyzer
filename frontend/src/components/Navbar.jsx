import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  const Item = ({ to, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={
          "px-3 py-2 rounded-xl text-sm transition " +
          (active ? "bg-white text-black" : "text-white/80 hover:bg-white/10")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-wide">
          Smart Interview Analyzer
        </Link>

        <nav className="flex items-center gap-2">
          <Item to="/" label="Dashboard" />
          <Item to="/interview" label="Interview" />
          <Item to="/insights" label="Insights" />
          <button
            onClick={logout}
            className="ml-2 px-3 py-2 rounded-xl text-sm border border-white/20 hover:bg-white/10 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}