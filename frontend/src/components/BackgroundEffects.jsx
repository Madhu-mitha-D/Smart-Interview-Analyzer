import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      <div className="absolute inset-0 bg-[#0c0c0d]" />

      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
        animate={{ x:[0,40,0], y:[0,20,0] }}
        transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 70%)"
        }}
      />

      <motion.div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
        animate={{ x:[0,-40,0], y:[0,-20,0] }}
        transition={{ duration:14, repeat:Infinity, ease:"easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 70% 70%, rgba(139,92,246,0.18), transparent 70%)"
        }}
      />

    </div>
  );
}