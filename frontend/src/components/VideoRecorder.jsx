import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const VideoRecorder = forwardRef(function VideoRecorder(
  { onRecordingComplete, onError, autoStartPreview = true },
  ref
) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const qualityIntervalRef = useRef(null);
  const qualityHistoryRef = useRef([]);

  const [previewing, setPreviewing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [error, setError] = useState("");
  const [qualityStatus, setQualityStatus] = useState("good");

  const clearQualityInterval = useCallback(() => {
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const analyzeFrameQuality = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 36;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let total = 0;
    for (let i = 0; i < image.length; i += 4) {
      const r = image[i];
      const g = image[i + 1];
      const b = image[i + 2];
      total += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avgBrightness = total / (canvas.width * canvas.height);

    const nextStatus =
      avgBrightness < 45 ? "low" : avgBrightness < 85 ? "fair" : "good";

    qualityHistoryRef.current.push(nextStatus);
    if (qualityHistoryRef.current.length > 4) {
      qualityHistoryRef.current.shift();
    }

    const counts = qualityHistoryRef.current.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    const stableStatus =
      counts.low >= 3 ? "low" : counts.fair >= 3 ? "fair" : counts.good >= 2 ? "good" : nextStatus;

    setQualityStatus(stableStatus);
  }, []);

  const attachVideo = useCallback((stream) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = () => {
      videoRef.current?.play?.().catch(() => {});
    };
  }, []);

  const startPreview = useCallback(async () => {
    try {
      setError("");

      if (streamRef.current) {
        attachVideo(streamRef.current);
        setPreviewing(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const videoTrack = stream.getVideoTracks?.()[0];
      if (videoTrack?.applyConstraints) {
        try {
          await videoTrack.applyConstraints({
            advanced: [
              { exposureMode: "continuous" },
              { whiteBalanceMode: "continuous" },
              { focusMode: "continuous" },
            ],
          });
        } catch {
        }
      }

      streamRef.current = stream;
      attachVideo(stream);
      setPreviewing(true);

      clearQualityInterval();
      qualityHistoryRef.current = [];
      qualityIntervalRef.current = setInterval(analyzeFrameQuality, 1400);
    } catch (err) {
      const msg = "Could not access camera/microphone";
      setError(msg);
      onError?.(msg);
    }
  }, [analyzeFrameQuality, attachVideo, clearQualityInterval, onError]);

  const stopPreview = useCallback(() => {
    clearQualityInterval();

    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }

    stopTracks();
    setPreviewing(false);
    setRecording(false);
    qualityHistoryRef.current = [];
  }, [clearQualityInterval, stopTracks]);

  const getSupportedMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    for (const type of candidates) {
      if (window.MediaRecorder?.isTypeSupported?.(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = useCallback(async () => {
    try {
      setError("");
      setVideoURL("");

      if (!streamRef.current) {
        await startPreview();
      }

      if (!streamRef.current) {
        throw new Error("No media stream available");
      }

      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(streamRef.current, { mimeType })
        : new MediaRecorder(streamRef.current);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setRecording(true);
      return true;
    } catch (err) {
      const msg = "Could not start recording";
      setError(msg);
      onError?.(msg);
      return false;
    }
  }, [onError, startPreview]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder) {
        resolve(null);
        return;
      }

      const finalize = () => {
        const mimeType = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setRecording(false);
        onRecordingComplete?.(blob);
        resolve(blob);
      };

      recorder.onstop = finalize;

      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        finalize();
      }
    });
  }, [onRecordingComplete]);

  useImperativeHandle(ref, () => ({
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
  }));

  useEffect(() => {
    if (autoStartPreview) {
      startPreview();
    }

    return () => {
      clearQualityInterval();
      if (videoURL) URL.revokeObjectURL(videoURL);
      stopTracks();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          {previewing && !recording && (
            <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-md">
              Preview
            </div>
          )}

          {recording && (
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              Recording
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white/75 backdrop-blur-md">
            Light:{" "}
            <span
              className={
                qualityStatus === "good"
                  ? "text-emerald-300"
                  : qualityStatus === "fair"
                  ? "text-amber-300"
                  : "text-red-300"
              }
            >
              {qualityStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!previewing ? (
          <button
            type="button"
            onClick={startPreview}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            Start Preview
          </button>
        ) : (
          <button
            type="button"
            onClick={stopPreview}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            Stop Preview
          </button>
        )}

        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={!previewing}
            className="rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/15"
          >
            Stop Recording
          </button>
        )}
      </div>

      {videoURL && (
        <div className="space-y-2">
          <p className="text-sm text-white/70">Recorded preview</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
            <video
              src={videoURL}
              controls
              className="aspect-video w-full object-cover"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
});

export default VideoRecorder;