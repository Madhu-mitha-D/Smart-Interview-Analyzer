import { motion } from "framer-motion";

export default function WordReveal({ text = "", className = "", delay = 0, as: Tag = "div" }) {
  const words = text.split(" ");
  return (
    <Tag className={className} style={{ fontFamily: "var(--font-display)" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: "110%", filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: delay + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
