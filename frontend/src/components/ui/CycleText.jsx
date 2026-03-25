import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * CycleText — cycles through words with a smooth clip + blur animation
 */
export default function CycleText({
  words = [],
  interval = 2200,
  className = "",
  highlightClassName = "",
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, filter: "blur(6px)" }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1, filter: "blur(0px)" }}
          exit={{ clipPath: "inset(0 0 0 100%)", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={highlightClassName || "text-gradient"}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
