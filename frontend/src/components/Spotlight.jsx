import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function Spotlight({
  className = "",
  size = 220,
  springOptions = { bounce: 0, stiffness: 120, damping: 20 },
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        const currentPosition = window.getComputedStyle(parent).position;
        if (currentPosition === "static") {
          parent.style.position = "relative";
        }
        parent.style.overflow = "hidden";
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;

    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", handleEnter);
    parentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", handleEnter);
      parentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      className={[
        "pointer-events-none absolute rounded-full blur-3xl transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.28), rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.04) 60%, transparent 80%)",
      }}
    />
  );
}