import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WordReveal({
  text,
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const words = text.split(" ");

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 24, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.65,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mr-3 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}