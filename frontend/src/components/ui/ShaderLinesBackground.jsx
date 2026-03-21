import { useEffect, useRef } from "react";

export default function ShaderLinesBackground() {
  const containerRef = useRef(null);
  const cleanupRef = useRef({
    animationId: null,
    renderer: null,
    resizeHandler: null,
    script: null,
  });

  useEffect(() => {
    const start = () => {
      if (containerRef.current && window.THREE) {
        initThreeJS();
      }
    };

    if (window.THREE) {
      start();
      return () => destroyScene();
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";
    script.async = true;
    script.onload = start;
    document.head.appendChild(script);
    cleanupRef.current.script = script;

    return () => destroyScene();
  }, []);

  const destroyScene = () => {
    if (cleanupRef.current.animationId) {
      cancelAnimationFrame(cleanupRef.current.animationId);
    }

    if (cleanupRef.current.resizeHandler) {
      window.removeEventListener("resize", cleanupRef.current.resizeHandler);
    }

    if (cleanupRef.current.renderer) {
      cleanupRef.current.renderer.dispose();
    }

    if (
      cleanupRef.current.script &&
      cleanupRef.current.script.parentNode === document.head
    ) {
      document.head.removeChild(cleanupRef.current.script);
    }
  };

  const initThreeJS = () => {
    if (!containerRef.current || !window.THREE) return;

    const THREE = window.THREE;
    const container = containerRef.current;
    container.innerHTML = "";

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float random(in float x) {
        return fract(sin(x) * 1e4);
      }

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

        float t = time * 0.06 + random(uv.x) * 0.4;
        float lineWidth = 0.0008;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) - length(uv));
          }
        }

        gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    cleanupRef.current.renderer = renderer;

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };

    cleanupRef.current.resizeHandler = onResize;
    onResize();
    window.addEventListener("resize", onResize, false);

    const animate = () => {
      cleanupRef.current.animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    };

    animate();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div ref={containerRef} className="absolute inset-0 opacity-[0.12]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.025),transparent_24%),linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.42))]" />
    </div>
  );
}