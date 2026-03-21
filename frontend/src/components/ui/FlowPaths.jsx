import { motion } from "framer-motion";

export default function FlowPaths() {
  const paths = [
    "M -120 80 C 120 40, 260 180, 520 120 S 860 20, 980 140",
    "M -140 220 C 80 170, 260 320, 500 260 S 860 140, 1000 300",
    "M -100 380 C 140 300, 280 500, 540 430 S 860 280, 1020 470",
    "M -140 540 C 110 470, 320 650, 560 590 S 860 430, 1020 640",
    "M -80 700 C 160 620, 320 820, 610 760 S 900 620, 1040 820",
    "M 40 -80 C 240 80, 420 180, 700 120 S 1040 0, 1180 180",
    "M 120 -40 C 300 120, 520 260, 780 220 S 1080 120, 1220 300",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#06070b]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(139,92,246,0.16),transparent_20%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.12),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_22%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.00)" />
            <stop offset="18%" stopColor="rgba(139,92,246,0.55)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="82%" stopColor="rgba(34,211,238,0.55)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.00)" />
          </linearGradient>

          <filter id="flow-blur">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {paths.map((d, i) => (
          <g key={i}>
            <motion.path
              d={d}
              stroke="url(#flow-line)"
              strokeWidth={1.4}
              strokeLinecap="round"
              filter="url(#flow-blur)"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{
                pathLength: [0.15, 1, 0.15],
                opacity: [0.16, 0.48, 0.16],
              }}
              transition={{
                duration: 10 + i * 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.45,
              }}
            />
            <motion.path
              d={d}
              stroke="url(#flow-line)"
              strokeWidth={0.8}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.18 }}
              animate={{
                pathLength: [0.08, 0.85, 0.08],
                opacity: [0.1, 0.34, 0.1],
              }}
              transition={{
                duration: 8 + i * 1.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.35,
              }}
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.18),rgba(0,0,0,0.30))]" />
    </div>
  );
}