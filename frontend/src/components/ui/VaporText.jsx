import { useEffect, useRef } from "react";

/**
 * VaporText — shimmering vapor / steam text effect using canvas
 * Pure CSS+canvas, no external deps
 */
export default function VaporText({ text = "", className = "", fontSize = 72, color = "#a78bfa" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let animId;
    let particles = [];
    let t = 0;

    const setup = () => {
      const w = container.offsetWidth;
      const h = fontSize * 2.2;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { w, h };
    };

    const { w, h } = setup();

    // Measure text
    ctx.font = `900 ${fontSize}px var(--font-display, 'Bricolage Grotesque', sans-serif)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Get pixel data of text
    ctx.fillStyle = "#fff";
    ctx.fillText(text, w / 2, h / 2);
    const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr);
    const pixels = imageData.data;

    ctx.clearRect(0, 0, w, h);

    // Seed particles from text pixels
    particles = [];
    const step = 4;
    for (let y = 0; y < h * dpr; y += step) {
      for (let x = 0; x < w * dpr; x += step) {
        const idx = (y * w * dpr + x) * 4;
        if (pixels[idx + 3] > 100) {
          particles.push({
            ox: x / dpr,
            oy: y / dpr,
            x: x / dpr,
            y: y / dpr,
            vx: 0,
            vy: 0,
            life: Math.random(),
            speed: 0.3 + Math.random() * 0.7,
            size: 1 + Math.random() * 1.5,
            drift: (Math.random() - 0.5) * 0.4,
          });
        }
      }
    }

    const render = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.life += p.speed * 0.008;
        if (p.life > 1) {
          p.life = 0;
          p.x = p.ox;
          p.y = p.oy;
          p.vx = 0;
          p.vy = 0;
        }

        // Vapor rise + drift
        const phase = p.life;
        const rise = phase * fontSize * 0.6;
        const sway = Math.sin(t * 1.5 + p.ox * 0.05) * 3 * phase;

        p.x = p.ox + sway + p.drift * rise * 0.5;
        p.y = p.oy - rise;

        // Alpha: sharp in body, fades as it rises
        const alpha = phase < 0.15
          ? phase / 0.15            // fade in
          : 1 - ((phase - 0.15) / 0.85);  // fade out as it rises

        // Color gradient: indigo → teal as it rises
        const tHue = phase;
        const r = Math.round(109 + (0 - 109) * tHue);
        const g = Math.round(95 + (229 - 95) * tHue);
        const b = Math.round(255 + (204 - 255) * tHue);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + phase * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.85})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [text, fontSize, color]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
    </div>
  );
}
