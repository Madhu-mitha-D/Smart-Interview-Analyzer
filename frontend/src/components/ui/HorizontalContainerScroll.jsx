import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function HorizontalCard({ item }) {
  const isVideo = item.type === "video";

  return (
    <div className="relative h-[22rem] w-[82vw] max-w-[52rem] shrink-0 overflow-hidden rounded-[30px] border border-white/10 bg-[#161616] p-2 shadow-2xl md:h-[30rem] md:w-[70vw] md:max-w-[64rem] md:p-4">
      <div className="relative h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950">
        {isVideo ? (
          <video
            src={item.src}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={item.src}
            alt={item.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            {item.eyebrow}
          </p>
          <p className="mt-1 text-sm text-white/92">{item.title}</p>
        </div>

        <div className="absolute bottom-5 left-5 max-w-md rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
          <p className="text-sm leading-6 text-white/82">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function HorizontalContainerScroll({
  titleComponent,
  items,
  sectionHeight = "260vh",
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [maxShift, setMaxShift] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);

    const calculateShift = () => {
      if (!trackRef.current) return;
      const totalWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      setMaxShift(Math.max(0, totalWidth - viewportWidth + 96));
    };

    checkMobile();
    calculateShift();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("resize", calculateShift);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", calculateShift);
    };
  }, [items]);

  const rotate = useTransform(scrollYProgress, [0, 0.18], [14, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.18],
    isMobile ? [0.94, 1] : [0.96, 1]
  );
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxShift]);

  return (
    <section
      ref={sectionRef}
      className="relative mt-24"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          className="relative w-full px-4 md:px-8"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            style={{ translateY: titleY }}
            className="mx-auto mb-10 max-w-4xl text-center"
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
            className="mx-auto w-full"
          >
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-8"
            >
              {items.map((item, index) => (
                <HorizontalCard key={`${item.title}-${index}`} item={item} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}