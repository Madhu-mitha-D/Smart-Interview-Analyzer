import { useEffect, useRef, useState } from "react";
import ShaderAnimation from "./ShaderAnimation";

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState("enter");
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    const t1 = setTimeout(() => setPhase("fly"), 2200);
    const t2 = setTimeout(() => setPhase("exit"), 3400);
    const t3 = setTimeout(() => {
      doneRef.current = true;
      setPhase("done");
      onComplete?.();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  const isFlying = phase === "fly" || phase === "exit";
  const isExiting = phase === "exit";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: isExiting ? "none" : "all",
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? "opacity 0.6s ease-in-out" : "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <ShaderAnimation />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: isFlying ? "20px" : "50%",
          left: isFlying ? "20px" : "50%",
          transform: isFlying ? "translate(0, 0)" : "translate(-50%, -50%)",
          transition: isFlying
            ? "top 1.0s cubic-bezier(0.4, 0, 0.2, 1), left 1.0s cubic-bezier(0.4, 0, 0.2, 1), transform 1.0s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
          display: "flex",
          alignItems: "center",
          gap: isFlying ? "8px" : "14px",
          animation: phase === "enter" ? "logoFadeIn 0.8s ease-out forwards" : undefined,
          opacity: phase === "enter" ? 0 : 1,
        }}
      >
        <div
          style={{
            width: isFlying ? "32px" : "64px",
            height: isFlying ? "32px" : "64px",
            transition: isFlying
              ? "width 1.0s cubic-bezier(0.4,0,0.2,1), height 1.0s cubic-bezier(0.4,0,0.2,1)"
              : "none",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isFlying
              ? "0 0 12px rgba(255,255,255,0.3)"
              : "0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(200,200,255,0.2)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: isFlying ? "14px" : "26px",
              fontWeight: 800,
              color: "#000",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "-1px",
              transition: isFlying
                ? "font-size 1.0s cubic-bezier(0.4,0,0.2,1)"
                : "none",
              lineHeight: 1,
            }}
          >
            SI
          </span>
        </div>

        <div style={{ overflow: "hidden" }}>
          <span
            style={{
              display: "block",
              fontSize: isFlying ? "15px" : "48px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'Courier New', Courier, monospace",
              letterSpacing: isFlying ? "-0.5px" : "-2px",
              lineHeight: 1,
              whiteSpace: "nowrap",
              textShadow: isFlying
                ? "none"
                : "0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(180,180,255,0.3)",
              transition: isFlying
                ? "font-size 1.0s cubic-bezier(0.4,0,0.2,1), letter-spacing 1.0s ease, text-shadow 0.6s ease"
                : "none",
            }}
          >
            Smart Interview
          </span>

          {!isFlying && (
            <span
              style={{
                display: "block",
                fontSize: "16px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "'Courier New', Courier, monospace",
                letterSpacing: "4px",
                marginTop: "6px",
                textTransform: "uppercase",
              }}
            >
              AI Interview Analyzer
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes logoFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}