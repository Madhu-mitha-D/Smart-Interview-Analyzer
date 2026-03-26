import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const COLS = [
  {
    label: "Platform",
    links: [
      { title: "Home",      to: "/" },
      { title: "Dashboard", to: "/dashboard" },
      { title: "Interview", to: "/interview" },
      { title: "Profile",   to: "/profile" },
    ],
  },
  {
    label: "Modes",
    links: [
      { title: "Domain Interview", to: "/interview/domain" },
      { title: "Resume Interview", to: "/interview/resume" },
      { title: "Coding Interview", to: "/interview/coding" },
      { title: "Analytics",        to: "/analytics" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Insights",   to: "/insights" },
      { title: "Progress",   to: "/analytics" },
      { title: "Help",       to: "/" },
      { title: "Changelog",  to: "/" },
    ],
  },
];

const SOCIALS = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.252 5.621 5.912-5.621zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
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
    <footer className="relative w-full max-w-6xl mx-auto mt-32 px-4">
      {/* Glowing top border */}
      <div className="relative h-px w-full mb-0 overflow-visible">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg,transparent,rgba(109,95,255,0.7) 30%,rgba(0,229,204,0.65) 70%,transparent)" }}
        />
        <div
          className="absolute inset-0 blur-[8px]"
          style={{ background: "linear-gradient(90deg,transparent,rgba(109,95,255,0.4) 35%,rgba(0,229,204,0.4) 65%,transparent)" }}
        />
      </div>

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(109,95,255,0.08) 0%,transparent 70%)", filter: "blur(40px)" }}
      />

      <div
        className="relative rounded-t-[40px] px-8 pt-14 pb-8 sm:px-12"
        style={{
          background: "radial-gradient(60% 120px at 50% 0%,rgba(255,255,255,0.03),transparent)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 xl:gap-16">

          {/* Brand column */}
          <Reveal delay={0.05}>
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="relative w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 20px rgba(109,95,255,0.4)" }}
                >
                  <span className="text-[11px] font-black text-white z-10 relative">SI</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    Smart Interview
                  </p>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Analyzer</p>
                </div>
              </div>

              <p className="text-sm text-white/35 leading-7 max-w-[260px] mb-6">
                AI-powered interview prep platform. Practice smarter, get feedback that matters, land the role.
              </p>

              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-white/40 font-mono">All systems operational</span>
              </div>

              {/* Stack badges */}
              <div className="flex flex-wrap gap-1.5 mb-7">
                {STACK.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono text-white/25 px-2 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] uppercase tracking-widest"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Socials */}
              <div className="flex items-center gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Links grid */}
          <div className="grid grid-cols-3 gap-8 xl:col-span-2">
            {COLS.map((col, i) => (
              <Reveal key={col.label} delay={0.1 + i * 0.07}>
                <div>
                  <h3
                    className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 mb-5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {col.label}
                  </h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.title}>
                        <Link
                          to={link.to}
                          className="group inline-flex items-center gap-1.5 text-[13px] text-white/38 hover:text-white/85 transition-all duration-200"
                        >
                          <span className="relative">
                            {link.title}
                            <span
                              className="absolute -bottom-px left-0 w-0 h-px group-hover:w-full transition-all duration-300 ease-out"
                              style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
                            />
                          </span>
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-3 h-3 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                          >
                            <path d="M3 8h10M9 4l4 4-4 4" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="text-[10px] font-mono text-white/18">v1.0.0</span>
            <div className="h-3 w-px bg-white/[0.08]" />
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }}
              />
              <span className="text-[10px] font-mono text-white/22">AI-Powered Prep</span>
            </div>
            <div className="h-3 w-px bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-white/18">© {year} Smart Interview Analyzer</span>
          </div>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Help"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors duration-200"
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