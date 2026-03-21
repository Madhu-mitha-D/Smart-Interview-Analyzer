import { useMemo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx, cy, r) {
  return generateEllipsePath(cx, cy, r, r);
}

function OrbitItem({
  item,
  index,
  totalItems,
  path,
  itemSize,
  rotation,
  progress,
  fill,
  onClick,
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div
      className="absolute will-change-transform select-none"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance,
      }}
    >
      <div
        style={{ transform: `rotate(${-rotation}deg)` }}
        className="h-full w-full"
      >
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="relative h-full w-full overflow-hidden rounded-2xl border border-white/14 bg-black/70 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          {item}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  shape = "ellipse",
  baseWidth = 1200,
  radiusX = 260,
  radiusY = 92,
  radius = 300,
  rotation = -6,
  duration = 24,
  itemSize = 92,
  direction = "normal",
  fill = true,
  width = "100%",
  height = 460,
  className = "",
  showPath = true,
  pathColor = "rgba(255,255,255,0.08)",
  pathWidth = 2,
  easing = "linear",
  paused = false,
  centerContent,
  responsive = true,
  onItemClick,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case "circle":
        return generateCirclePath(designCenterX, designCenterY, radius);
      case "ellipse":
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY);
    }
  }, [shape, designCenterX, designCenterY, radiusX, radiusY, radius]);

  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;

    const controls = animate(progress, direction === "reverse" ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: "loop",
    });

    return () => controls.stop();
  }, [progress, duration, easing, direction, paused]);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{ width, height }}
    >
      <div
        className={responsive ? "absolute left-1/2 top-1/2" : "relative h-full w-full"}
        style={{
          width: responsive ? baseWidth : "100%",
          height: responsive ? baseWidth : "100%",
          transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined,
          transformOrigin: "center center",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="absolute inset-0 pointer-events-none"
            >
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth / scale}
              />
            </svg>
          )}

          {images.map((item, index) => (
            <OrbitItem
              key={index}
              item={item.node}
              index={index}
              totalItems={images.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              progress={progress}
              fill={fill}
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}