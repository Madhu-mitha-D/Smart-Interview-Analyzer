import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ContainerScrollAnimation({ titleComponent, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleRange = isMobile ? [0.82, 0.96] : [1.08, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[52rem] items-center justify-center px-4 py-16 md:h-[72rem] md:px-8"
    >
      <div
        className="relative w-full max-w-6xl py-10 md:py-28"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{ translateY: translate }}
          className="mx-auto max-w-4xl text-center"
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className="mx-auto mt-[-1.5rem] h-[24rem] w-full max-w-5xl rounded-[30px] border border-white/10 bg-[#161616] p-2 shadow-2xl md:h-[36rem] md:p-4"
        >
          <div className="h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}