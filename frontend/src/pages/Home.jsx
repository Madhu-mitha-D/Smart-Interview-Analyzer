import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GradientBlindsBackground from "../components/GradientBlindsBackground";

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70 backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
      {children}
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.24)]"
    >
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-[#040406] text-white">
      {/* Full-page background */}
      <div className="absolute inset-0 z-0">
        <GradientBlindsBackground />
      </div>

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.16),rgba(0,0,0,0.40))]" />

      {/* Full-width page layer */}
      <div className="relative z-10 w-full">
        {/* Center only the content, not the page */}
        <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
          <section className="min-h-[78vh]">
            <div className="max-w-3xl pt-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SectionLabel>AI interview workspace</SectionLabel>

                <h1 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
                  Practice interviews
                  <br />
                  with AI-powered feedback
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  Simulate interview rounds, get answer analysis, track your
                  progress, and build confidence before the real thing.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => nav("/interview")}
                    className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:scale-[1.03]"
                  >
                    Start Interview
                  </button>

                  <button
                    onClick={() => nav("/dashboard")}
                    className="rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3 text-sm text-white/90 backdrop-blur-xl transition hover:bg-white/[0.1]"
                  >
                    Open Dashboard
                  </button>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 grid gap-4 md:grid-cols-3">
              <FeatureCard
                title="Adaptive interview rounds"
                desc="Practice by domain and difficulty with a cleaner interview flow."
              />
              <FeatureCard
                title="Insights and analytics"
                desc="Review scores, weak domains, and performance trends over time."
              />
              <FeatureCard
                title="Resume and coding modes"
                desc="Extend practice beyond basic Q&A with richer interview formats."
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}