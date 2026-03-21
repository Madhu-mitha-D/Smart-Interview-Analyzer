import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrbitImages from "./OrbitImages";

export default function OrbitModes({ items = [] }) {
  const [active, setActive] = useState(null);

  const orbitNodes = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        node:
          item.type === "video" ? (
            <video
              src={item.src}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={item.src}
              alt={item.title}
              draggable={false}
              className="h-full w-full object-cover"
            />
          ),
      })),
    [items]
  );

  return (
    <div className="relative">
      <OrbitImages
        images={orbitNodes}
        shape="ellipse"
        radiusX={260}
        radiusY={92}
        rotation={-6}
        duration={24}
        itemSize={92}
        responsive
        direction="normal"
        fill
        showPath
        paused={false}
        pathColor="rgba(255,255,255,0.08)"
        pathWidth={2}
        height={460}
        onItemClick={setActive}
        centerContent={
          <div className="max-w-sm text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-white/36">
              Interactive preview
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
              Click a mode
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/52 sm:text-base">
              Explore the platform through a compact orbit experience.
            </p>
          </div>
        }
      />

      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0f] shadow-[0_25px_100px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md transition hover:bg-black/60"
              >
                Close
              </button>

              <div className="relative h-[260px] w-full sm:h-[360px] md:h-[460px]">
                {active.type === "video" ? (
                  <video
                    src={active.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={active.src}
                    alt={active.title}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  {active.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  {active.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  {active.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}