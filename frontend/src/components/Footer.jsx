import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    {
      heading: "Platform",
      items: [
        { label: "Home", to: "/" },
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
        { label: "Progress", to: "/insights" },
        { label: "Profile", to: "/profile" },
      ],
    },
  ];

  return (
    <footer className="relative mt-32 border-t border-white/[0.06]">
      {/* Top glow line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(124,108,250,0.5) 30%, rgba(56,200,232,0.5) 70%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c6cfa, #38c8e8)" }}>
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M8 2L14 12H2L8 2Z" stroke="white" strokeWidth="1.3" fill="none"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Smart Interview Analyzer
              </span>
            </div>
            <p className="text-sm leading-7 text-white/42 max-w-[260px]">
              AI-powered interview preparation — practice, analyze, and improve your interview skills.
            </p>

            {/* Status badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-white/45">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  style={{ animation: "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </div>
          </div>

          {/* Link columns */}
          {links.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/28 mb-4">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-white/48 transition hover:text-white/85"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/28">
            © {year} Smart Interview Analyzer. Built for ambitious interview candidates.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/22 font-mono">v1.0.0</span>
            <span className="text-white/15">·</span>
            <span className="text-[10px] text-white/22">React + FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}