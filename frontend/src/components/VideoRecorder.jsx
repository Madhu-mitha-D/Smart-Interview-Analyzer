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
    let message = "Lighting looks good.";

    if (avg < 60 || darkRatio > 0.45) {
      brightness = "low";
      message = "Low light detected. Move to a brighter place.";
    } else if (avg > 185 || brightRatio > 0.25) {
      brightness = "high";
      message = "Too much brightness detected. Reduce backlight.";
    }

    if (stdDev < 28) {
      contrast = "low";
      if (brightness === "good") {
        message = "Low contrast detected. Improve face lighting.";
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

  const qualityTone =
    qualityStatus.brightness === "low" || qualityStatus.brightness === "high"
      ? "text-amber-200"
      : qualityStatus.contrast === "low"
      ? "text-yellow-200"
      : "text-emerald-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Video Interview</h3>
        <div className="text-xs text-white/55">
          {recording ? "Recording..." : previewing ? "Camera ready" : "Camera off"}
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-[220px] w-full object-cover sm:h-[260px] lg:h-[300px]"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${qualityTone}`}>{qualityStatus.message}</p>
        <div className="text-xs text-white/45">640×360 • 15–20 fps</div>
      </div>
    </div>
  );
});

export default VideoRecorder;