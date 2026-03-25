import { motion } from "framer-motion";
import { useState } from "react";

/**
 * BentoGrid — adapted from 21st.dev BentoGrid component
 * Styled to match our indigo/teal dark design system
 */
export function BentoGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      {items.map((item, i) => (
        <BentoCard key={i} item={item} index={i} />
      ))}
    </div>
  );
}

function BentoCard({ item, index }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const active = hovered || item.hasPersistentHover;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={[
        "group relative overflow-hidden rounded-2xl p-5 cursor-default transition-all duration-300 will-change-transform",
        item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
        item.hasPersistentHover ? "-translate-y-0.5" : "",
      ].join(" ")}
      style={{
        background: active
          ? "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: active
          ? "1px solid rgba(255,255,255,0.14)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: active
          ? "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(109,95,255,0.1)"
          : "0 2px 12px rgba(0,0,0,0.2)",
        transition: "background 0.3s, border 0.3s, box-shadow 0.3s, transform 0.2s",
      }}
    >
      {/* Dot pattern overlay on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          backgroundImage: "radial-gradient(circle at center, rgba(109,95,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Mouse-tracking radial glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(280px circle at ${mousePos.x}% ${mousePos.y}%, rgba(109,95,255,0.12), transparent 55%)`,
        }}
      />

      {/* Gradient border shimmer */}
      <div
        className="absolute inset-0 -z-10 rounded-2xl p-px transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: "linear-gradient(135deg, rgba(109,95,255,0.3), transparent 40%, rgba(0,229,204,0.2))",
        }}
      />

      {/* Top highlight line */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0.3,
          background: "linear-gradient(90deg, transparent, rgba(109,95,255,0.6), rgba(0,229,204,0.4), transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3 h-full">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: active
                ? "linear-gradient(135deg, rgba(109,95,255,0.3), rgba(0,229,204,0.2))"
                : "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {item.icon}
          </div>
          {(item.status) && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm font-mono uppercase tracking-widest transition-all duration-300"
              style={{
                background: active ? "rgba(109,95,255,0.18)" : "rgba(255,255,255,0.06)",
                border: active ? "1px solid rgba(109,95,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "rgba(167,139,250,0.9)" : "rgba(237,237,245,0.4)",
              }}
            >
              {item.status}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="space-y-2 flex-1">
          <h3 className="font-bold text-white text-[15px] leading-snug tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {item.title}
            {item.meta && (
              <span className="ml-2 text-[11px] text-white/30 font-mono font-normal tracking-widest">{item.meta}</span>
            )}
          </h3>
          <p className="text-[13px] text-white/52 leading-6" style={{ fontFamily: "var(--font-body)" }}>
            {item.description}
          </p>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-wrap gap-1.5">
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/38 transition-all duration-200"
                style={{
                  background: active ? "rgba(109,95,255,0.12)" : "rgba(255,255,255,0.05)",
                  border: active ? "1px solid rgba(109,95,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <span
            className="text-[11px] text-white/30 font-mono transition-all duration-200"
            style={{ opacity: active ? 1 : 0 }}
          >
            {item.cta || "Explore →"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
