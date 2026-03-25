import { motion } from "framer-motion";

export function PrimaryButton({ className = "", children, disabled, ...props }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white btn-shimmer",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
        className,
      ].join(" ")}
      style={!disabled ? {
        background: "linear-gradient(135deg, #6d5fff 0%, #00e5cc 100%)",
        boxShadow: "0 0 20px rgba(109,95,255,0.3)",
      } : { background: "rgba(109,95,255,0.3)" }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ className = "", children, disabled, ...props }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white/70",
        "border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white",
        "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DangerButton({ className = "", children, disabled, ...props }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-red-300",
        "border border-red-500/25 bg-red-500/10 hover:bg-red-500/20",
        "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}
