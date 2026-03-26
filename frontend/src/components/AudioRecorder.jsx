import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Live waveform bars ──────────────────────────────────────── */
function Waveform({ analyser }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bars = 32;
      const step = Math.floor(bufferLength / bars);
      const barWidth = (canvas.width / bars) - 2;

      for (let i = 0; i < bars; i++) {
        const val = dataArray[i * step] / 255;
        const h = Math.max(4, val * canvas.height * 0.9);
        const x = i * (barWidth + 2);
        const y = (canvas.height - h) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, `rgba(109,95,255,${0.4 + val * 0.6})`);
        grad.addColorStop(1, `rgba(0,229,204,${0.4 + val * 0.6})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 2);
        ctx.fill();
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={56}
      className="w-full h-14 opacity-90"
    />
  );
}

/* ── Timer ───────────────────────────────────────────────────── */
function Timer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="text-[13px] font-mono text-white/60 tabular-nums">
      {mm}:{ss}
    </span>
  );
}

export default function AudioRecorder({ onRecorded }) {
  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [status, setStatus]   = useState("idle");   // idle | recording | done
  const [error, setError]     = useState("");
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    return () => {
      mediaRef.current?.stream?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const start = useCallback(async () => {
    setError("");
    setBlobUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up analyser
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source  = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url  = URL.createObjectURL(blob);
        setBlobUrl(url);
        onRecorded?.(blob);
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
        analyserRef.current = null;
      };

      mr.start();
      setStatus("recording");
    } catch {
      setError("Microphone permission denied or not available.");
    }
  }, [onRecorded]);

  const stop = useCallback(() => {
    try { mediaRef.current?.stop(); } catch {}
    setStatus("done");
  }, []);

  const reset = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setStatus("idle");
    setError("");
  }, [blobUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(109,95,255,0.5),rgba(0,229,204,0.4),transparent)" }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Mic icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: status === "recording"
                  ? "rgba(255,77,136,0.15)"
                  : "rgba(109,95,255,0.12)",
                border: status === "recording"
                  ? "1px solid rgba(255,77,136,0.3)"
                  : "1px solid rgba(109,95,255,0.25)",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                className="w-4 h-4"
                style={{ color: status === "recording" ? "#ff4d88" : "#a78bfa" }}
              >
                <rect x="5" y="1" width="6" height="8" rx="3" />
                <path d="M2 7c0 3.314 2.686 6 6 6s6-2.686 6-6" />
                <path d="M8 13v2" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-none mb-0.5">
                Audio Response
              </p>
              <p className="text-[11px] text-white/35">
                {status === "idle" && "Click to start recording"}
                {status === "recording" && "Recording in progress…"}
                {status === "done" && "Recording complete"}
              </p>
            </div>
          </div>

          {/* Timer */}
          <Timer running={status === "recording"} />
        </div>

        {/* Waveform / idle state */}
        <div
          className="rounded-xl mb-4 flex items-center justify-center overflow-hidden"
          style={{
            height: "72px",
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "recording" && analyserRef.current ? (
              <motion.div
                key="wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full px-3 flex items-center"
              >
                <Waveform analyser={analyserRef.current} />
              </motion.div>
            ) : status === "done" && blobUrl ? (
              <motion.div
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full px-4"
              >
                <audio
                  src={blobUrl}
                  controls
                  className="w-full h-9"
                  style={{ filter: "invert(1) sepia(1) saturate(2) hue-rotate(225deg)" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: `${8 + Math.sin(i * 0.7) * 8}px`,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/[0.08]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-3.5 h-3.5 text-red-400 flex-shrink-0">
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3" /><circle cx="8" cy="11" r="0.5" fill="currentColor" />
              </svg>
              <p className="text-[12px] text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-2">
          {status === "idle" && (
            <motion.button
              onClick={start}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg,#6d5fff,#00e5cc)",
                boxShadow: "0 0 20px rgba(109,95,255,0.3)",
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <rect x="5" y="1" width="6" height="8" rx="3" />
                <path d="M2 7c0 3.314 2.686 6 6 6s6-2.686 6-6M8 13v2" />
              </svg>
              Start Recording
            </motion.button>
          )}

          {status === "recording" && (
            <motion.button
              onClick={stop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 relative overflow-hidden transition-all"
              style={{
                background: "linear-gradient(135deg,#ff4d88,#ff2255)",
                boxShadow: "0 0 20px rgba(255,77,136,0.4)",
              }}
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: "rgba(255,77,136,0.4)" }} />
              <span className="relative z-10 flex items-center gap-2">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <rect x="3" y="3" width="10" height="10" rx="1.5" />
                </svg>
                Stop Recording
              </span>
            </motion.button>
          )}

          {status === "done" && (
            <>
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-full text-sm font-semibold text-white/60 border border-white/[0.1] hover:border-white/20 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-3.5 h-3.5">
                  <path d="M2 8A6 6 0 1 1 8 14" /><path d="M2 4v4h4" />
                </svg>
                Re-record
              </motion.button>
              <div className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-full text-sm font-semibold text-teal-300 border border-teal-500/25 bg-teal-500/[0.08]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-3.5 h-3.5">
                  <path d="m2 8 4 4 8-8" />
                </svg>
                Ready to submit
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}