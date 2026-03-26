import {
  forwardRef, useEffect, useImperativeHandle,
  useRef, useState, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const ANALYSIS_INTERVAL_MS = 1200;

/* ── Timer ───────────────────────────────────────────────────── */
function RecordTimer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="tabular-nums font-mono text-sm text-white/80">{mm}:{ss}</span>
  );
}

/* ── Quality dot ─────────────────────────────────────────────── */
function QualityDot({ status }) {
  const cfg = {
    good:     { color: "#00e5cc", label: "Good lighting" },
    low:      { color: "#f59e0b", label: "Low light" },
    checking: { color: "#6d5fff", label: "Checking…" },
  };
  const { color, label } = cfg[status] || cfg.checking;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="relative flex h-2 w-2"
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
          style={{ background: color }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="text-[10px] font-mono text-white/40">{label}</span>
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
const VideoRecorder = forwardRef(function VideoRecorder(
  { onError, autoStartPreview = true },
  ref
) {
  const videoRef              = useRef(null);
  const mediaRecorderRef      = useRef(null);
  const streamRef             = useRef(null);
  const chunksRef             = useRef([]);
  const stopPromiseResolverRef = useRef(null);
  const analysisTimerRef      = useRef(null);
  const canvasRef             = useRef(null);

  const [previewing,   setPreviewing]   = useState(false);
  const [recording,    setRecording]    = useState(false);
  const [error,        setError]        = useState("");
  const [qualityStatus, setQualityStatus] = useState("checking");

  /* ── helpers ─────────────────────────────────────────────── */
  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearQualityLoop = () => {
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  };

  const getSupportedMimeType = () => {
    const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  const analyzeFrameQuality = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = 160; canvas.height = 90;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 160, 90);

    const { data } = ctx.getImageData(0, 0, 160, 90);
    let totalBrightness = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    const avg = totalBrightness / pixels;
    setQualityStatus(avg < 50 ? "low" : "good");
  }, []);

  /* ── public API ──────────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    startPreview: startPreview,
    startRecording: startRecording,
    stopRecording: stopRecording,
    stopPreview: () => {
      clearQualityLoop();
      stopTracks();
      setPreviewing(false);
    },
    isRecording: () => recording,
    isPreviewing: () => previewing,
  }));

  const startPreview = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
      setPreviewing(true);
      analysisTimerRef.current = setInterval(analyzeFrameQuality, ANALYSIS_INTERVAL_MS);
    } catch {
      const msg = "Camera/mic permission denied.";
      setError(msg);
      onError?.(msg);
    }
  }, [analyzeFrameQuality, onError]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const mr = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      stopPromiseResolverRef.current?.({
        blob: new Blob(chunksRef.current, { type: mimeType || "video/webm" }),
        mimeType: mimeType || "video/webm",
      });
    };
    mr.start(200);
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      stopPromiseResolverRef.current = resolve;
      try { mediaRecorderRef.current?.stop(); } catch {}
      setRecording(false);
    });
  }, []);

  useEffect(() => {
    if (autoStartPreview) startPreview();
    return () => {
      clearQualityLoop();
      stopTracks();
    };
  }, [autoStartPreview, startPreview]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px z-10"
        style={{ background: "linear-gradient(90deg,transparent,rgba(109,95,255,0.5),rgba(0,229,204,0.4),transparent)" }}
      />

      {/* Video viewport */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)", display: previewing ? "block" : "none" }}
        />

        {/* Offline state */}
        {!previewing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(109,95,255,0.12)", border: "1px solid rgba(109,95,255,0.25)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.6" className="w-7 h-7">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </div>
            <p className="text-sm text-white/35 font-mono">Camera inactive</p>
          </div>
        )}

        {/* Recording badge */}
        <AnimatePresence>
          {recording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,77,136,0.4)", backdropFilter: "blur(8px)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
              <RecordTimer running={recording} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality indicator */}
        {previewing && (
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <QualityDot status={qualityStatus} />
          </div>
        )}

        {/* Recording border glow */}
        {recording && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ boxShadow: "inset 0 0 0 2px rgba(255,77,136,0.5)" }}
          />
        )}

        {/* Corner HUD marks */}
        {previewing && (
          <>
            {[["top-2 left-2", "border-t border-l"], ["top-2 right-2", "border-t border-r"],
              ["bottom-2 left-2", "border-b border-l"], ["bottom-2 right-2", "border-b border-r"]].map(([pos, borders], i) => (
              <div
                key={i}
                className={`absolute ${pos} w-4 h-4 ${borders} opacity-30`}
                style={{ borderColor: recording ? "#ff4d88" : "#6d5fff" }}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <p className="text-[12px] font-semibold text-white/70 leading-none mb-0.5">
            {recording ? "Recording" : previewing ? "Preview Active" : "Video Response"}
          </p>
          <p className="text-[10px] text-white/30 font-mono">
            {recording ? "Your answer is being captured" : previewing ? "Camera & mic ready" : "Enable camera to begin"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!previewing && (
            <motion.button
              onClick={startPreview}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-[12px] font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#6d5fff,#00e5cc)", boxShadow: "0 0 18px rgba(109,95,255,0.35)" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
                <path d="M15 4l-5 3.5L15 11V4z" />
                <rect x="1" y="3" width="9" height="10" rx="1.5" />
              </svg>
              Enable Camera
            </motion.button>
          )}

          {previewing && !recording && (
            <motion.button
              onClick={startRecording}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-[12px] font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#ff4d88,#ff2255)", boxShadow: "0 0 18px rgba(255,77,136,0.4)" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              Record
            </motion.button>
          )}

          {recording && (
            <motion.button
              onClick={() => stopRecording().catch(() => {})}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full text-[12px] font-bold text-white border border-white/20 hover:bg-white/[0.08] transition-all"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <rect x="2" y="2" width="12" height="12" rx="1" />
              </svg>
              Stop
            </motion.button>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/[0.08]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-3.5 h-3.5 text-red-400 flex-shrink-0">
              <circle cx="8" cy="8" r="6" /><path d="M8 5v3" /><circle cx="8" cy="11" r="0.5" fill="currentColor" />
            </svg>
            <p className="text-[11.5px] text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default VideoRecorder;