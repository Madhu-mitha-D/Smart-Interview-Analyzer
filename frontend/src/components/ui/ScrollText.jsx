import { motion } from "framer-motion";

export default function ScrollText({ text = "", className = "", delay = 0, as: Tag = "p" }) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.26em]"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
