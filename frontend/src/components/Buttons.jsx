import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

/* ── Base CVA button ─────────────────────────────────────────── */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "text-sm font-semibold select-none transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "rounded-xl bg-white/[0.08] text-white border border-white/[0.1] hover:bg-white/[0.12] hover:border-white/20",
        primary:
          "rounded-xl text-white border border-transparent",
        outline:
          "rounded-xl border border-white/[0.12] bg-transparent text-white/75 hover:bg-white/[0.06] hover:text-white hover:border-white/20",
        ghost:
          "rounded-xl border border-transparent text-white/50 hover:text-white hover:bg-white/[0.06]",
        destructive:
          "rounded-xl text-red-300 border border-red-500/20 bg-red-500/[0.08] hover:bg-red-500/[0.14] hover:border-red-500/35",
        link:
          "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300 px-0",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm:      "h-7 px-3 text-xs rounded-lg",
        lg:      "h-11 px-6 text-sm",
        xl:      "h-12 px-8 text-[15px]",
        icon:    "h-9 w-9 rounded-xl p-0",
        "icon-sm": "h-7 w-7 rounded-lg p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isPrimary = variant === "primary";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        style={
          isPrimary
            ? {
                background: "linear-gradient(135deg,#6d5fff 0%,#00e5cc 100%)",
                boxShadow: "0 0 24px rgba(109,95,255,0.3)",
              }
            : undefined
        }
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

/* ── Gradient primary button with shimmer ────────────────────── */
export function PrimaryButton({ children, className = "", loading = false, ...props }) {
  return (
    <motion.button
      whileHover={!loading && !props.disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!loading && !props.disabled ? { scale: 0.97 } : {}}
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden",
        "px-6 py-3 rounded-full text-sm font-bold text-white",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
        className
      )}
      style={{
        background: loading
          ? "rgba(109,95,255,0.45)"
          : "linear-gradient(135deg,#6d5fff 0%,#00e5cc 100%)",
        boxShadow: loading ? "none" : "0 0 28px rgba(109,95,255,0.38)",
        ...props.style,
      }}
    >
      {/* Shimmer overlay */}
      {!loading && (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          aria-hidden
        >
          <span
            className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20"
            style={{ animation: "shimmer-slide 2.4s infinite" }}
          />
        </span>
      )}

      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Loading…
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

/* ── Ghost / outline button ──────────────────────────────────── */
export function GhostButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={!props.disabled ? { scale: 1.01 } : {}}
      whileTap={!props.disabled ? { scale: 0.97 } : {}}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "px-5 py-3 rounded-full text-sm font-semibold",
        "border border-white/[0.1] bg-white/[0.04] text-white/70",
        "hover:bg-white/[0.08] hover:text-white hover:border-white/20",
        "transition-all duration-200",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/* ── Icon button ─────────────────────────────────────────────── */
export function IconButton({ children, className = "", label, variant = "ghost", ...props }) {
  return (
    <motion.button
      whileHover={!props.disabled ? { scale: 1.06 } : {}}
      whileTap={!props.disabled ? { scale: 0.93 } : {}}
      {...props}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200",
        "w-9 h-9 text-white/50",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
        variant === "outline"
          ? "border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.09] hover:text-white hover:border-white/20"
          : "hover:bg-white/[0.07] hover:text-white",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/* ── Danger button ───────────────────────────────────────────── */
export function DangerButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={!props.disabled ? { scale: 1.02 } : {}}
      whileTap={!props.disabled ? { scale: 0.97 } : {}}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "px-5 py-2.5 rounded-full text-sm font-semibold",
        "text-red-300 border border-red-500/25 bg-red-500/[0.08]",
        "hover:bg-red-500/[0.16] hover:border-red-500/40 hover:text-red-200",
        "transition-all duration-200",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

/* ── Glow pulse button (for CTAs / recording states) ─────────── */
export function PulseButton({ children, pulsing = false, className = "", ...props }) {
  return (
    <motion.button
      whileHover={!props.disabled ? { scale: 1.04 } : {}}
      whileTap={!props.disabled ? { scale: 0.96 } : {}}
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-full text-sm font-bold text-white",
        "transition-all duration-300",
        "disabled:opacity-40 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50",
        className
      )}
      style={{
        background: pulsing
          ? "linear-gradient(135deg,#ff4d88,#ff2255)"
          : "linear-gradient(135deg,#6d5fff,#00e5cc)",
        boxShadow: pulsing
          ? "0 0 32px rgba(255,77,136,0.45)"
          : "0 0 28px rgba(109,95,255,0.35)",
      }}
    >
      {pulsing && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: "rgba(255,77,136,0.4)" }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}