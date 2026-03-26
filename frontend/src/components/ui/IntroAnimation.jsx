import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShimmerText from "./shimmer-text";

function LetterReveal({ text, start = false, className = "" }) {
  const chars = text.split("");

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={
            start
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 18, filter: "blur(6px)" }
          }
          transition={{
            duration: 0.35,
            delay: 0.45 + i * 0.045,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function IntroAnimation({ onComplete }) {
  const doneRef = useRef(false);
  const [phase, setPhase] = useState("logo");

  useEffect(() => {
    if (doneRef.current) return;

    const t1 = setTimeout(() => setPhase("title"), 350);
    const t2 = setTimeout(() => setPhase("subtitle"), 1500);
    const t3 = setTimeout(() => setPhase("shimmer"), 2400);
    const t4 = setTimeout(() => setPhase("fade"), 3900);
    const t5 = setTimeout(() => {
      doneRef.current = true;
      onComplete?.();
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const fading = phase === "fade";
  const showTitle =
    phase === "title" ||
    phase === "subtitle" ||
    phase === "shimmer" ||
    phase === "fade";
  const showSubtitle =
    phase === "subtitle" || phase === "shimmer" || phase === "fade";
  const showShimmer = phase === "shimmer" || phase === "fade";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#03030a",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, rgba(3,3,10,0.96) 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <motion.div
          animate={fading ? { scale: 0.985, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "14px",
            width: "min(96vw, 1200px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.9, filter: "blur(6px)" }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "22px",
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
                boxShadow:
                  "0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(18px)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  letterSpacing: "-1px",
                }}
              >
                SI
              </span>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", minHeight: "80px" }}>
              <AnimatePresence mode="wait">
                {!showShimmer ? (
                  <motion.div
                    key="letters"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontSize: "clamp(34px, 5.5vw, 68px)",
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                      letterSpacing: "-2px",
                      lineHeight: 1,
                    }}
                  >
                    <LetterReveal
                      text="Smart Interview Analyzer"
                      start={showTitle}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="shimmer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ShimmerText
                      className="text-white"
                      duration={1.2}
                      delay={0.1}
                    >
                      <span
                        style={{
                          fontSize: "clamp(34px, 5.5vw, 68px)",
                          fontWeight: 800,
                          fontFamily:
                            "'Bricolage Grotesque', system-ui, sans-serif",
                          letterSpacing: "-2px",
                          lineHeight: 1,
                        }}
                      >
                        Smart Interview Analyzer
                      </span>
                    </ShimmerText>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={
              showSubtitle
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 10, filter: "blur(4px)" }
            }
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.38)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            Performance Analyzer
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}