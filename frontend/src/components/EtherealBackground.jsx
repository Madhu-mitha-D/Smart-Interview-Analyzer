import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";

function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  if (fromLow === fromHigh) return toLow;
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

export default function EtherealBackground({
  color = "rgba(128,128,128,1)",
  animation = { scale: 100, speed: 90 },
  noise = { opacity: 1, scale: 1.2 },
}) {
  const feColorMatrixRef = useRef(null);
  const hueRotate = useMotionValue(0);

  const displacementScale = mapRange(animation.scale, 1, 100, 20, 100);
  const duration = mapRange(animation.speed, 1, 100, 1000, 50);

  useEffect(() => {
    const controls = animate(hueRotate, 360, {
      duration: duration / 25,
      repeat: Infinity,
      ease: "linear",
      onUpdate: (v) => {
        if (feColorMatrixRef.current) {
          feColorMatrixRef.current.setAttribute("values", String(v));
        }
      },
    });

    return () => controls.stop();
  }, [duration, hueRotate]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        style={{
          position: "absolute",
          inset: -displacementScale,
          filter: `url(#shadow-filter) blur(4px)`,
        }}
      >
        <svg style={{ position: "absolute" }}>
          <defs>
            <filter id="shadow-filter">
              <feTurbulence
                result="undulation"
                numOctaves="2"
                baseFrequency={`${mapRange(
                  animation.scale,
                  0,
                  100,
                  0.001,
                  0.0005
                )},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`}
                seed="0"
                type="turbulence"
              />

              <feColorMatrix
                ref={feColorMatrixRef}
                in="undulation"
                type="hueRotate"
                values="180"
              />

              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
              />

              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale={displacementScale}
                result="dist"
              />

              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale={displacementScale}
                result="output"
              />
            </filter>
          </defs>
        </svg>

        <div
          style={{
            backgroundColor: color,
            maskImage:
              "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            maskSize: "cover",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {noise.opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")',
            backgroundSize: noise.scale * 200,
            backgroundRepeat: "repeat",
            opacity: noise.opacity / 2,
          }}
        />
      )}
    </div>
  );
}