import { useEffect, useRef } from "react";

/**
 * GlobalBackground — GodRays-style animated shader background
 * Uses pure canvas to replicate the GodRays + MeshGradient aesthetic
 * from @paper-design/shaders-react, adapted to our indigo/teal palette.
 * No external shader library needed.
 */
export default function GlobalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      // Fallback: CSS-only animated gradient
      return;
    }

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;

      // Hash & noise
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1,0)), f.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = p * 2.0 + vec2(1.7, 9.2);
          a *= 0.5;
        }
        return v;
      }

      // God rays from top-right
      float godRays(vec2 uv, vec2 src, float t) {
        vec2 dir = uv - src;
        float angle = atan(dir.y, dir.x);
        float dist = length(dir);
        float rays = 0.0;
        for (int i = 0; i < 8; i++) {
          float phase = float(i) * 0.8 + t * 0.18;
          float ray = sin(angle * float(i + 3) + phase) * 0.5 + 0.5;
          ray = pow(ray, 4.0);
          rays += ray * (1.0 / (dist * 2.5 + 0.5));
        }
        return clamp(rays * 0.15, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.4;

        // Base mesh gradient — slow drifting blobs
        vec2 p = uv * 2.5;
        float n1 = fbm(p + vec2(t * 0.12, t * 0.07));
        float n2 = fbm(p + vec2(-t * 0.09, t * 0.13) + 3.4);
        float n3 = fbm(p * 1.4 + vec2(t * 0.06, -t * 0.11) + 7.1);

        // Color palette: deep indigo, electric teal, hot pink — matching our design tokens
        vec3 indigo = vec3(0.043, 0.008, 0.196);    // very deep indigo
        vec3 violet = vec3(0.427, 0.373, 1.0);       // #6d5fff
        vec3 teal   = vec3(0.0,   0.898, 0.8);       // #00e5cc
        vec3 pink   = vec3(1.0,   0.302, 0.533);     // #ff4d88
        vec3 dark   = vec3(0.012, 0.012, 0.039);     // #03030a bg

        // Blend blobs
        vec3 col = dark;
        col = mix(col, indigo, smoothstep(0.3, 0.7, n1) * 0.9);
        col = mix(col, violet, smoothstep(0.4, 0.75, n2) * 0.65);
        col = mix(col, teal,   smoothstep(0.5, 0.8, n3) * 0.45);
        col = mix(col, pink,   smoothstep(0.6, 0.9, n1 * n3) * 0.22);

        // God rays from top-right offset
        vec2 src = vec2(0.85 + sin(t * 0.08) * 0.05, 1.1);
        float rays = godRays(uv, src, t);
        col += violet * rays * 0.6;
        col += teal * rays * 0.3;

        // Grain
        float g = hash(uv * u_res + vec2(t * 100.0)) * 0.028;
        col += g;

        // Vignette
        vec2 vig = uv * 2.0 - 1.0;
        col *= 1.0 - dot(vig, vig) * 0.45;

        // Clamp + slight contrast boost
        col = clamp(col, 0.0, 1.0);
        col = col * 0.9 + col * col * 0.1;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_res");

    let animId;
    let start = performance.now();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
      {/* Extra CSS fallback layer if WebGL fails — still looks great */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 85% -10%, rgba(109,95,255,0.35) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 50% at 10% 90%, rgba(0,229,204,0.2) 0%, transparent 55%)",
            "radial-gradient(ellipse 50% 40% at 60% 50%, rgba(255,77,136,0.1) 0%, transparent 60%)",
          ].join(", "),
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
