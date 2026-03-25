import { useEffect, useRef } from "react";

// Animated particle mesh + noise background using canvas
export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const PARTICLE_COUNT = 55;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.28,
      speedY: (Math.random() - 0.5) * 0.28,
      opacity: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.5 ? 252 : 174, // indigo or teal
    }));

    // Connection lines distance threshold
    const MAX_DIST = 160;

    function drawFrame() {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      t += 0.003;

      // Update particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.15;
            const hue = (particles[i].hue + particles[j].hue) / 2;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const pulse = Math.sin(t * 2 + p.x * 0.01) * 0.25 + 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 72%, ${p.opacity * pulse})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Deep canvas particle mesh */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Animated gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(109,95,255,0.22) 0%, transparent 70%)",
          animation: "glow-breathe 6s ease-in-out infinite",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-8%] w-[50vw] h-[50vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,229,204,0.16) 0%, transparent 70%)",
          animation: "glow-breathe-2 8s ease-in-out 1s infinite",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,77,136,0.1) 0%, transparent 70%)",
          animation: "glow-breathe-3 10s ease-in-out 2s infinite",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle scan line effect */}
      <div
        className="absolute inset-x-0 h-px opacity-20"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(109,95,255,0.6), rgba(0,229,204,0.6), transparent)",
          animation: "scan-line 12s linear infinite",
          top: 0,
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(3,3,10,0.7) 100%)",
        }}
      />

      {/* Dark overlay to deepen the feel */}
      <div className="absolute inset-0 bg-[#03030a]/60" />
    </div>
  );
}
