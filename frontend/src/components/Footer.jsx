import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Home,
  LayoutDashboard,
  MessagesSquare,
  Lightbulb,
  BarChart3,
  User,
} from "lucide-react";

const COLS = [
  {
    label: "Platform",
    links: [
      { title: "Home", to: "/", icon: Home },
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { title: "Interview", to: "/interview", icon: MessagesSquare },
      { title: "Profile", to: "/profile", icon: User },
    ],
  },
  {
    label: "Modes",
    links: [
      { title: "Domain Interview", to: "/interview/domain" },
      { title: "Resume Interview", to: "/interview/resume" },
      { title: "Coding Interview", to: "/interview/coding" },
      { title: "Analytics", to: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Insights", to: "/insights", icon: Lightbulb },
      { title: "Progress", to: "/analytics" },
      { title: "Help", to: "/" },
      { title: "Changelog", to: "/" },
    ],
  },
];

const SOCIALS = [
  { label: "GitHub", href: "#", icon: Github },
  { label: "LinkedIn", href: "#", icon: Linkedin },
];

const STACK = ["React", "FastAPI", "PostgreSQL", "AI/ML"];

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mx-auto mt-28 w-full max-w-7xl px-4 sm:px-6">
      <div className="mb-0 h-px w-full bg-gradient-to-r from-transparent via-white/16 to-transparent" />

      <div className="relative rounded-t-[36px] border-t border-white/[0.05] px-6 pt-14 pb-8 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_65%)]" />

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-16">
          <Reveal delay={0.05}>
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white">
                  <span
                    className="text-[11px] font-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    SI
                  </span>
                </div>

                <div>
                  <p
                    className="text-sm font-bold leading-none text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Smart Interview
                  </p>
                  <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-white/28">
                    Analyzer
                  </p>
                </div>
              </div>

              <p className="mb-6 max-w-[280px] text-sm leading-7 text-white/35">
                AI-powered interview preparation platform. Practice smarter,
                review performance, and improve with guided feedback.
              </p>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-50 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white/80" />
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  System active
                </span>
              </div>

              <div className="mb-7 flex flex-wrap gap-1.5">
                {STACK.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white/25"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/85"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 xl:col-span-2 xl:gap-8">
            {COLS.map((col, i) => (
              <Reveal key={col.label} delay={0.1 + i * 0.07}>
                <div>
                  <h3
                    className="mb-5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/20"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {col.label}
                  </h3>

                  <ul className="space-y-3">
                    {col.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.title}>
                          <Link
                            to={link.to}
                            className="group inline-flex items-center gap-2 text-[13px] text-white/38 transition-all duration-200 hover:text-white/85"
                          >
                            {Icon ? <Icon className="h-3.5 w-3.5 text-white/28 group-hover:text-white/55" /> : null}
                            <span className="relative">
                              {link.title}
                              <span className="absolute -bottom-px left-0 h-px w-0 bg-white/55 transition-all duration-300 ease-out group-hover:w-full" />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <span className="text-[10px] font-mono text-white/18">v1.0.0</span>
            <div className="h-3 w-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-white/22">
              AI-Powered Prep
            </span>
            <div className="h-3 w-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-white/18">
              © {year} Smart Interview Analyzer
            </span>
          </div>

          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Help"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[10px] font-mono text-white/20 transition-colors duration-200 hover:text-white/50"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}