import { useEffect, useRef, useState } from "react";

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState("enter");
  const doneRef = useRef(false);
  const canvasRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      hue: Math.random() > 0.5 ? 252 : 174,
      op: Math.random() * 0.6 + 0.2,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,72%,${p.op})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    const t1 = setTimeout(() => setPhase("fly"), 2000);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(() => {
      doneRef.current = true;
      setPhase("done");
      onComplete?.();
    }, 3900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "done") return null;
  const isFlying = phase === "fly" || phase === "exit";
  const isExiting = phase === "exit";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      pointerEvents: isExiting ? "none" : "all",
      opacity: isExiting ? 0 : 1,
      transition: isExiting ? "opacity 0.65s ease-in-out" : "none",
      background: "#03030a",
    }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6, mixBlendMode: "screen" }} />

      {/* Gradient orbs */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(109,95,255,0.25),transparent 70%)", filter: "blur(60px)", animation: "glow-breathe 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "-8%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,229,204,0.18),transparent 70%)", filter: "blur(70px)", animation: "glow-breathe-2 6s ease-in-out 1s infinite" }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(3,3,10,0.8) 100%)" }} />

      {/* Logo */}
      <div style={{
        position: "absolute",
        top: isFlying ? "20px" : "50%",
        left: isFlying ? "24px" : "50%",
        transform: isFlying ? "translate(0,0)" : "translate(-50%,-50%)",
        transition: isFlying ? "top 0.9s cubic-bezier(0.16,1,0.3,1), left 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
        display: "flex", alignItems: "center",
        gap: isFlying ? "8px" : "16px",
        animation: phase === "enter" ? "logoFadeIn 0.8s ease-out forwards" : undefined,
        opacity: phase === "enter" ? 0 : 1,
      }}>
        {/* Logo mark */}
        <div style={{
          width: isFlying ? "32px" : "68px",
          height: isFlying ? "32px" : "68px",
          borderRadius: isFlying ? "12px" : "20px",
          background: "linear-gradient(135deg,#6d5fff,#00e5cc)",
          boxShadow: isFlying ? "0 0 14px rgba(109,95,255,0.5)" : "0 0 50px rgba(109,95,255,0.6), 0 0 100px rgba(0,229,204,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative", overflow: "hidden",
          transition: isFlying ? "all 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.22),transparent)" }} />
          <span style={{
            fontSize: isFlying ? "13px" : "28px",
            fontWeight: 900, color: "white",
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            letterSpacing: isFlying ? "0" : "-1px",
            transition: isFlying ? "font-size 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
          }}>SI</span>
        </div>

        {/* Logo text */}
        <div style={{ overflow: "hidden" }}>
          <span style={{
            display: "block",
            fontSize: isFlying ? "15px" : "52px",
            fontWeight: 800, color: "white",
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            letterSpacing: isFlying ? "-0.5px" : "-2.5px",
            lineHeight: 1, whiteSpace: "nowrap",
            textShadow: isFlying ? "none" : "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(109,95,255,0.4)",
            transition: isFlying ? "all 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
          }}>
            Smart Interview
          </span>
          {!isFlying && (
            <span style={{
              display: "block", fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,0.45)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "5px", marginTop: "6px", textTransform: "uppercase",
            }}>
              AI Analyzer
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes logoFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.82); filter: blur(8px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.4; filter: blur(60px); } 50% { opacity: 0.8; filter: blur(48px); }
        }
        @keyframes glow-breathe-2 {
          0%,100% { opacity: 0.35; filter: blur(70px); } 50% { opacity: 0.7; filter: blur(55px); }
        }
      `}</style>
    </div>
  );
}
