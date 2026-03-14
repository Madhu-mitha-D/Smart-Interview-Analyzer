import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const VideoRecorder = forwardRef(function VideoRecorder(
  { onError, autoStartPreview = true },
  ref
) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const stopPromiseResolverRef = useRef(null);

  const [previewing, setPreviewing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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

  const startPreview = async () => {
    if (streamRef.current) {
      attachStreamToVideo(streamRef.current);
      setPreviewing(true);
      return true;
    }

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      attachStreamToVideo(stream);
      setPreviewing(true);
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

    stopTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRecording(false);
    setPreviewing(false);
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
        ? new MediaRecorder(streamRef.current, { mimeType })
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
      stopPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/65">
        Camera stays active for the whole interview. Each answer is recorded
        automatically and submitted when you press <span className="text-white">Submit</span>.
      </div>
    </div>
  );
});

export default VideoRecorder;