import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const ANALYSIS_INTERVAL_MS = 1200;

const VideoRecorder = forwardRef(function VideoRecorder(
  { onError, autoStartPreview = true },
  ref
) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const stopPromiseResolverRef = useRef(null);
  const analysisTimerRef = useRef(null);
  const canvasRef = useRef(null);

  const [previewing, setPreviewing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [qualityStatus, setQualityStatus] = useState({
    brightness: "checking",
    contrast: "checking",
    message: "Checking camera conditions...",
  });

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const clearQualityLoop = () => {
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  };

  const attachStreamToVideo = (stream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const getSupportedMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const analyzeFrameQuality = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;

    const sampleWidth = 160;
    const sampleHeight = 90;

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, sampleWidth, sampleHeight);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    } catch {
      return;
    }

    let totalLuma = 0;
    let totalSq = 0;
    let darkPixels = 0;
    let brightPixels = 0;

    const pixelCount = imageData.length / 4;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuma += luma;
      totalSq += luma * luma;

      if (luma < 45) darkPixels += 1;
      if (luma > 220) brightPixels += 1;
    }

    const avg = totalLuma / pixelCount;
    const variance = totalSq / pixelCount - avg * avg;
    const stdDev = Math.sqrt(Math.max(variance, 0));

    const darkRatio = darkPixels / pixelCount;
    const brightRatio = brightPixels / pixelCount;

    let brightness = "good";
    let contrast = "good";
    let message = "Lighting looks good for video analysis.";

    if (avg < 60 || darkRatio > 0.45) {
      brightness = "low";
      message =
        "Low lighting detected. Move to a brighter place or face a light source.";
    } else if (avg > 185 || brightRatio > 0.25) {
      brightness = "high";
      message =
        "Too much brightness detected. Reduce backlight or avoid strong light behind you.";
    }

    if (stdDev < 28) {
      contrast = "low";
      if (brightness === "good") {
        message =
          "Low contrast detected. Try improving lighting so your face is more clearly visible.";
      }
    }

    setQualityStatus({ brightness, contrast, message });
  };

  const startQualityLoop = () => {
    clearQualityLoop();
    analyzeFrameQuality();
    analysisTimerRef.current = setInterval(
      analyzeFrameQuality,
      ANALYSIS_INTERVAL_MS
    );
  };

  const startPreview = async () => {
    if (streamRef.current) {
      attachStreamToVideo(streamRef.current);
      setPreviewing(true);
      startQualityLoop();
      return true;
    }

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15, max: 20 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      attachStreamToVideo(stream);
      setPreviewing(true);

      const video = videoRef.current;
      if (video) {
        const onLoaded = () => {
          startQualityLoop();
          video.removeEventListener("loadedmetadata", onLoaded);
        };
        video.addEventListener("loadedmetadata", onLoaded);
      } else {
        startQualityLoop();
      }

      return true;
    } catch (err) {
      let msg = "Unable to access camera and microphone.";

      if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg = "No camera or microphone detected on this device.";
      } else if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError"
      ) {
        msg = "Camera or microphone permission was denied.";
      } else if (
        err?.name === "NotReadableError" ||
        err?.name === "TrackStartError"
      ) {
        msg = "Camera is already in use by another application.";
      } else if (err?.name === "OverconstrainedError") {
        msg = "Requested camera settings are not supported on this device.";
      }

      setError(msg);
      setPreviewing(false);
      if (onError) onError(msg);
      return false;
    }
  };

  const stopPreview = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    clearQualityLoop();
    stopTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRecording(false);
    setPreviewing(false);
    setQualityStatus({
      brightness: "checking",
      contrast: "checking",
      message: "Camera is off.",
    });
  };

  const startRecording = async () => {
    const ready = await startPreview();
    if (!ready || !streamRef.current) {
      const msg = "Camera preview is not available.";
      setError(msg);
      if (onError) onError(msg);
      return false;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      return true;
    }

    try {
      setError("");
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(streamRef.current, {
            mimeType,
            videoBitsPerSecond: 450000,
            audioBitsPerSecond: 64000,
          })
        : new MediaRecorder(streamRef.current);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        const msg = "An error occurred while recording video.";
        setError(msg);
        setRecording(false);
        if (onError) onError(msg);

        if (stopPromiseResolverRef.current) {
          stopPromiseResolverRef.current(null);
          stopPromiseResolverRef.current = null;
        }
      };

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: mimeType || "video/webm",
          });

          setRecording(false);

          if (stopPromiseResolverRef.current) {
            stopPromiseResolverRef.current(blob);
            stopPromiseResolverRef.current = null;
          }
        } catch {
          const msg = "Failed to process recorded video.";
          setError(msg);
          if (onError) onError(msg);

          if (stopPromiseResolverRef.current) {
            stopPromiseResolverRef.current(null);
            stopPromiseResolverRef.current = null;
          }
        }
      };

      recorder.start();
      setRecording(true);
      return true;
    } catch {
      const msg = "Failed to start recording.";
      setError(msg);
      if (onError) onError(msg);
      return false;
    }
  };

  const stopRecording = async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    ) {
      return null;
    }

    return new Promise((resolve) => {
      stopPromiseResolverRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  };

  useImperativeHandle(ref, () => ({
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
    isPreviewing: () => previewing,
    isRecording: () => recording,
  }));

  useEffect(() => {
    if (autoStartPreview) {
      startPreview();
    }

    return () => {
      clearQualityLoop();
      stopPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qualityBadgeClass =
    qualityStatus.brightness === "low" || qualityStatus.brightness === "high"
      ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
      : qualityStatus.contrast === "low"
      ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";

  const qualityLabel =
    qualityStatus.brightness === "low"
      ? "Low Light"
      : qualityStatus.brightness === "high"
      ? "Too Bright"
      : qualityStatus.contrast === "low"
      ? "Low Contrast"
      : "Good Conditions";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Video Interview</h3>
        <div className="text-sm text-white/60">
          {recording
            ? "Recording answer..."
            : previewing
            ? "Camera ready"
            : "Camera off"}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${qualityBadgeClass}`}
        >
          {qualityLabel}
        </div>

        <div className="text-xs text-white/55">
          Optimized for future confidence analysis • 640×360 • 15–20 fps
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/65">
        {qualityStatus.message}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/65">
        Camera stays active for the whole interview. Each answer is recorded
        automatically and submitted when you press <span className="text-white">Submit</span>.
      </div>
    </div>
  );
});

export default VideoRecorder;