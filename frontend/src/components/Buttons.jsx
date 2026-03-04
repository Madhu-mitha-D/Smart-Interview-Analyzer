import { motion } from "framer-motion";

export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "px-5 py-2 rounded-xl text-sm font-medium",
        "bg-white text-black",
        "hover:shadow-[0_10px_40px_rgba(255,255,255,0.12)]",
        "transition disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ className = "", children, ...props }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "px-4 py-2 rounded-xl text-sm",
        "border border-white/15 bg-white/5 hover:bg-white/10",
        "transition disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DangerButton({ className = "", children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "px-4 py-2 rounded-xl text-sm",
        "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
        "transition disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </motion.button>
  );
}