import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export default function ReactiveBackground() {
  const mx = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const my = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const sx = useSpring(mx, { stiffness: 70, damping: 20, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 70, damping: 20, mass: 0.5 });

  const blob1X = useTransform(sx, [0, 1920], [-90, 90]);
  const blob1Y = useTransform(sy, [0, 1080], [-60, 60]);

  const blob2X = useTransform(sx, [0, 1920], [70, -70]);
  const blob2Y = useTransform(sy, [0, 1080], [50, -50]);

  useEffect(() => {
    const onMove = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#09090b]" />

      <motion.div
        style={{ x: blob1X, y: blob1Y }}
        className="absolute -left-32 -top-24 h-[42rem] w-[42rem] rounded-full blur-3xl"
        animate={{ opacity: [0.28, 0.42, 0.28], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(139,92,246,0.34), rgba(59,130,246,0.10) 42%, transparent 72%)",
          }}
        />
      </motion.div>

      <motion.div
        style={{ x: blob2X, y: blob2Y }}
        className="absolute -bottom-28 -right-24 h-[46rem] w-[46rem] rounded-full blur-3xl"
        animate={{ opacity: [0.2, 0.34, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 68% 68%, rgba(14,165,233,0.28), rgba(139,92,246,0.08) 42%, transparent 74%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 700px at var(--x) var(--y), rgba(255,255,255,0.10), transparent 58%)",
          "--x": sx,
          "--y": sy,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.15),rgba(9,9,11,0.55))]" />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(60% 60% at 50% 35%, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(60% 60% at 50% 35%, black 0%, transparent 72%)",
        }}
      />

      {Array.from({ length: 16 }).map((_, i) => {
        const size = 4 + (i % 4) * 2;
        const left = `${(i * 11) % 100}%`;
        const top = `${(i * 17) % 100}%`;
        const duration = 8 + (i % 5) * 2.5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/35 blur-[1px]"
            style={{ width: size, height: size, left, top }}
            animate={{
              y: [0, -18, 0],
              x: [0, 10, 0],
              opacity: [0.16, 0.45, 0.16],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        );
      })}
    </div>
  );
}