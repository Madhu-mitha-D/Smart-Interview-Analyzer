import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ScrollText({
  as = "p",
  text,
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const Tag = as;

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 36, filter: "blur(12px)" }}
        animate={
          isInView
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 36, filter: "blur(12px)" }
        }
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Tag className={className}>{text}</Tag>
      </motion.div>
    </div>
  );
}