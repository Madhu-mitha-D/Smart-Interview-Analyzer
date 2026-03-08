import { useEffect, useRef, useState } from "react";

export default function VideoRecorder({
  onRecordingComplete,
  onError,
  autoStartPreview = true,
}) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const objectUrlRef = useRef("");

  const [previewing, setPreviewing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [error, setError] = useState("");

  const clearVideoUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    setVideoURL("");
  };

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startPreview = async () => {
    try {
      setError("");

      // Stop old preview first if already running
      stopTracks();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPreviewing(true);
    } catch (err) {
      let msg = "Unable to access camera and microphone.";

      if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg = "No camera or microphone detected on this device.";
      } else if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError"
      ) {
        msg = "Camera or microphone permission was denied.";
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        msg = "Camera is already in use by another application.";
      } else if (err?.name === "OverconstrainedError") {
        msg = "Requested camera settings are not supported on this device.";
      }

      setError(msg);
      setPreviewing(false);
      if (onError) onError(msg);
    }
  };

  const stopPreview = () => {
    stopTracks();

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setPreviewing(false);
  };

  const getSupportedMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4", // may not work in many browsers for MediaRecorder
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const startRecording = () => {
    if (!streamRef.current) {
      const msg = "Start camera preview first.";
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    try {
      setError("");
      clearVideoUrl();
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
      };

      recorder.onstop = () => {
        try {
          const type = mimeType || "video/webm";
          const blob = new Blob(chunksRef.current, { type });

          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setVideoURL(url);

          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }
        } catch {
          const msg = "Failed to process recorded video.";
          setError(msg);
          if (onError) onError(msg);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      const msg = "Failed to start recording.";
      setError(msg);
      if (onError) onError(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (autoStartPreview) {
      startPreview();
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      stopPreview();
      clearVideoUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadVideo = () => {
    if (!videoURL) return;

    const a = document.createElement("a");
    a.href = videoURL;
    a.download = "interview-recording.webm";
    a.click();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Video Interview</h3>
        <div className="text-sm text-white/60">
          {recording
            ? "Recording..."
            : previewing
            ? "Camera Ready"
            : "Camera Off"}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">
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

      <div className="flex flex-wrap gap-3">
        {!previewing ? (
          <button
            onClick={startPreview}
            disabled={recording}
            className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopPreview}
            disabled={recording}
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
          >
            Stop Camera
          </button>
        )}

        {!recording ? (
          <button
            onClick={startRecording}
            disabled={!previewing}
            className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition"
          >
            Stop Recording
          </button>
        )}

        {videoURL ? (
          <button
            onClick={downloadVideo}
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Download Video
          </button>
        ) : null}
      </div>

      {videoURL ? (
        <div className="space-y-2">
          <p className="text-sm text-white/70">Recorded Preview</p>
          <video
            src={videoURL}
            controls
            className="w-full rounded-2xl border border-white/10"
          />
        </div>
      ) : null}
    </div>
  );
}