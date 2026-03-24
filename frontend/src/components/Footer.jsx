import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: "Platform",
      items: [
        { label: "Home",      to: "/" },
        { label: "Dashboard", to: "/dashboard" },
        { label: "Interview", to: "/interview" },
      ],
    },
    {
      heading: "Modes",
      items: [
        { label: "Domain Interview", to: "/interview/domain" },
        { label: "Resume Interview", to: "/interview/resume" },
        { label: "Coding Interview", to: "/interview/coding" },
      ],
    },
    {
      heading: "Insights",
      items: [
        { label: "Analytics", to: "/analytics" },
        { label: "Progress",  to: "/insights"  },
        { label: "Profile",   to: "/profile"   },
      ],
    },
  ];

  return (
    <footer className="relative mt-32">
      {/* Gradient divider line */}
      <div className="relative h-px w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(124,108,250,0.55) 30%, rgba(56,200,232,0.55) 70%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 blur-[6px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(124,108,250,0.35) 30%, rgba(56,200,232,0.35) 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            {/* Logo */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[12px]"
                style={{
                  background: "linear-gradient(135deg,#ffffff 0%,#d8d0ff 55%,#b0a0f0 100%)",
                  boxShadow: "0 0 16px rgba(200,190,255,0.18)",
                }}
              >
                <svg viewBox="0 0 32 32" fill="none" className="h-[18px] w-[18px]">
                  <path
                    d="M22 10C22 7.8 20.2 6 18 6H14C11.8 6 10 7.8 10 10C10 12.2 11.8 14 14 14H18C20.2 14 22 15.8 22 18C22 20.2 20.2 22 18 22H14C11.8 22 10 20.2 10 18"
                    stroke="black" strokeWidth="2.5" strokeLinecap="round"
                  />
                </svg>
              </div>
              <span
                className="text-[13.5px] font-semibold tracking-[-0.2px] text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Smart Interview
              </span>
            </div>

            <p className="max-w-[250px] text-sm leading-7 text-white/38">
              AI-powered interview preparation — practice, analyze, and improve your interview performance.
            </p>

            {/* Status badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/40">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  style={{ animation: "footerPing 2.2s cubic-bezier(0,0,0.2,1) infinite" }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </div>

            {/* Tech stack badge */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/30">
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: "linear-gradient(135deg,#7c6cfa,#38c8e8)" }}
              />
              React · FastAPI · PostgreSQL
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/22">
                {col.heading}
              </p>
              <ul className="space-y-3.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-2 text-sm text-white/42 transition-colors hover:text-white/80"
                    >
                      <span
                        className="h-px w-3 flex-shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:w-4"
                        style={{ background: "linear-gradient(90deg,#7c6cfa,#38c8e8)" }}
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.055] pt-8 sm:flex-row">
          <p className="text-xs text-white/24">
            © {year} Smart Interview Analyzer. Built for ambitious interview candidates.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/18">v1.0.0</span>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "linear-gradient(135deg,#7c6cfa,#38c8e8)" }}
              />
              <span className="text-[10px] text-white/22">AI-Powered Prep</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerPing {
          0%   { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </footer>
  );
}
