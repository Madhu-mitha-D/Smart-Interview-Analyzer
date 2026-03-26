import React from "react";
import { motion } from "framer-motion";

export function BentoGrid({ items = [], className = "" }) {
  return (
    <div className={["grid grid-cols-1 gap-4 md:grid-cols-3", className].join(" ")}>
      {items.map((item, index) => {
        const active = item.hasPersistentHover;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className={[
              "group relative overflow-hidden rounded-[22px] border",
              "border-white/[0.08] bg-black",
              "transition-all duration-300",
              "hover:border-white/[0.12]",
              item.colSpan === 2 ? "md:col-span-2" : "",
            ].join(" ")}
          >
            {/* base hover lighting */}
            <div
              className={[
                "absolute inset-0 transition-opacity duration-300",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              ].join(" ")}
            >
              {/* dotted texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:4px_4px]" />

              {/* strong spotlight from top-right */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />

              {/* wide soft wash through the middle */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_58%)]" />

              {/* subtle bottom sheen */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_58%,rgba(255,255,255,0.03)_100%)]" />
            </div>

            {/* extra bloom for stronger glow */}
            <div
              className={[
                "pointer-events-none absolute inset-0 transition-opacity duration-300",
                active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              ].join(" ")}
            >
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/[0.10] blur-3xl" />
              <div className="absolute left-[18%] top-[18%] h-40 w-40 rounded-full bg-white/[0.04] blur-3xl" />
            </div>

            <div className="relative z-10 flex h-full flex-col space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
                  {item.icon}
                </div>

                <span className="rounded-xl bg-white/[0.10] px-3 py-1.5 text-xs font-semibold text-white/80">
                  {item.status || "Active"}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-[17px] font-semibold tracking-tight text-white">
                  {item.title}
                  {item.meta ? (
                    <span className="ml-2 text-sm font-normal text-white/45">
                      {item.meta}
                    </span>
                  ) : null}
                </h3>

                <p className="max-w-[95%] text-sm leading-8 text-white/78">
                  {item.description}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-xl bg-white/[0.10] px-3 py-1.5 text-xs text-white/58"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span
                  className={[
                    "text-sm text-white/62 transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  ].join(" ")}
                >
                  {item.cta || "Explore →"}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}