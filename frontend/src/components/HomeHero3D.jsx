import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SplineScene from "./SplineScene";
import Spotlight from "./Spotlight";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export default function HomeHero3D() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/[0.92] shadow-[0_0_40px_rgba(255,255,255,0.04)]">
      <Spotlight className="-top-20 left-10 md:left-1/2" size={260} />

      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-2">
        <div className="relative z-10 flex items-center p-6 sm:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              AI-powered interview preparation
            </div>

            <h1 className="mt-5 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl lg:text-6xl">
              Practice smarter. Perform better.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/68 sm:text-base">
              Smart Interview Analyzer helps you prepare with domain interviews,
              resume-based questions, coding rounds, audio analysis, and video-enabled
              practice in one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/interview"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
              >
                Start Interview
              </Link>

              <Link
                to="/dashboard"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/85 transition hover:bg-white/10"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Domain Interview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Resume Interview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Coding Practice
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Video Analysis
              </span>
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-[320px] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/10 lg:hidden" />
          <SplineScene scene={SCENE_URL} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}