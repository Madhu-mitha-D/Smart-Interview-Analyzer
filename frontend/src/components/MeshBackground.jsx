import { useEffect, useRef } from "react";

export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 26 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      a: Math.random() * 0.08 + 0.02,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#040507]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-30"
      />

      <div className="beam-bg absolute inset-0" />

      <div className="absolute inset-0 bg-[radial-gradient(38%_18%_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_16%,transparent_84%,rgba(255,255,255,0.02))]" />

      <div className="absolute -left-[12%] top-[-18%] h-[34rem] w-[34rem] rounded-full bg-white/[0.035] blur-[150px]" />
      <div className="absolute -right-[12%] top-[-16%] h-[30rem] w-[30rem] rounded-full bg-[#2f65ff]/[0.07] blur-[160px]" />
      <div className="absolute bottom-[-20%] left-1/2 h-[22rem] w-[60rem] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[180px]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.52)_100%)]" />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}