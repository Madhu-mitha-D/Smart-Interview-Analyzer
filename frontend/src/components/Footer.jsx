import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const footerLinks = [
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
      { title: "Insights",     to: "/insights" },
      { title: "Progress",     to: "/analytics" },
      { title: "Help",         to: "/" },
      { title: "Changelog",    to: "/" },
    ],
  },
  {
    label: "Social",
    links: [
      {
        title: "GitHub",
        to: "#",
        icon: () => (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mr-1.5">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        ),
      },
      {
        title: "Twitter",
        to: "#",
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1.5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.252 5.621 5.912-5.621zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
      },
      {
        title: "LinkedIn",
        to: "#",
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1.5">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
          </svg>
        ),
      },
      {
        title: "YouTube",
        to: "#",
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1.5">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
          </svg>
        ),
      },
    ],
  },
];

function AnimatedSection({ children, delay = 0.1, className = "" }) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full max-w-6xl mx-auto mt-32">
      {/* Top gradient blur line */}
      <div className="relative h-px w-full overflow-visible mb-0">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(109,95,255,0.7) 30%, rgba(0,229,204,0.7) 70%, transparent 100%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px blur-[6px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(109,95,255,0.5) 30%, rgba(0,229,204,0.5) 70%, transparent 100%)" }}
        />
        {/* Center glow bloom */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px blur-[12px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(109,95,255,0.8), rgba(0,229,204,0.8), transparent)" }}
        />
      </div>

      {/* Subtle background radial glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(109,95,255,0.1) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div
        className="relative rounded-t-[36px] px-6 py-14 sm:px-10 lg:py-16"
        style={{
          background: "radial-gradient(35% 128px at 50% 0%, rgba(255,255,255,0.045), transparent)",
          borderTop: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        <div className="grid w-full gap-10 xl:grid-cols-3 xl:gap-12">
          {/* Brand col */}
          <AnimatedSection delay={0.05}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 20px rgba(109,95,255,0.4)" }}
              >
                <span className="text-[10px] font-black text-white select-none">SI</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <span className="text-[14px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Smart Interview
              </span>
            </div>

            <p className="text-sm leading-7 text-white/35 max-w-[240px] mb-6">
              AI-powered interview preparation. Practice, analyze, and improve your performance.
            </p>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/[0.07] bg-white/[0.025] mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] text-white/42">All systems operational</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {["React", "FastAPI", "PostgreSQL", "AI"].map(t => (
                <span key={t} className="text-[10px] font-mono text-white/22 px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02]">{t}</span>
              ))}
            </div>

            <p className="text-[11px] font-mono text-white/22 mt-6">
              © {year} Smart Interview Analyzer
            </p>
          </AnimatedSection>

          {/* Links grid */}
          <div className="mt-4 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
            {footerLinks.map((section, i) => (
              <AnimatedSection key={section.label} delay={0.1 + i * 0.07}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/22 mb-4" style={{ fontFamily: "var(--font-body)" }}>
                  {section.label}
                </h3>
                <ul className="space-y-3">
                  {section.links.map(link => (
                    <li key={link.title}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center text-[13px] text-white/38 hover:text-white/80 transition-all duration-200"
                      >
                        {link.icon && <link.icon />}
                        <span className="relative">
                          {link.title}
                          <span
                            className="absolute -bottom-px left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                            style={{ background: "linear-gradient(90deg,#6d5fff,#00e5cc)" }}
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.05] pt-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/18">v1.0.0</span>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)" }} />
              <span className="text-[10px] font-mono text-white/22">AI-Powered Prep</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[10px] font-mono text-white/18">Built for builders</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/18">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
