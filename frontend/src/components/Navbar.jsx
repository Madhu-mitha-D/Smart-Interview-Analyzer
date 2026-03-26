import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";
import { MenuToggleIcon } from "./ui/menu-toggle-icon";
import { useScroll } from "./ui/use-scroll";

export default function Navbar({ title = "Home" }) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthed = Boolean(token);

  const links = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Interview", href: "/interview" },
    { label: "Insights", href: "/insights" },
    { label: "Analytics", href: "/analytics" },
    { label: "Profile", href: "/profile" },
  ];

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto mt-3 w-[calc(100%-20px)] max-w-5xl rounded-2xl border border-white/10 bg-black/35 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 ease-out",
        {
          "bg-black/55 border-white/12 shadow-[0_16px_50px_rgba(0,0,0,0.36)]":
            scrolled && !open,
          "bg-black/70": open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <Link
          to="/"
          id="navbar-brand-anchor"
          className="flex items-center gap-3"
        >
          <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/12 bg-white/[0.05]">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-white">
              SIA
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-white">
              Smart Interview Analyzer
            </p>
            <p className="truncate text-xs text-white/38">{title}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed &&
            links.map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className={buttonVariants({
                  variant: isActive(link.href) ? "outline" : "ghost",
                })}
              >
                {link.label}
              </Link>
            ))}

          {isAuthed && (
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          )}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          "bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4"
          )}
        >
          <div className="grid gap-y-2">
            {isAuthed &&
              links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={buttonVariants({
                    variant: isActive(link.href) ? "outline" : "ghost",
                    className: "justify-start",
                  })}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          <div className="flex flex-col gap-2">
            {isAuthed && (
              <Button variant="outline" className="w-full" onClick={logout}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}