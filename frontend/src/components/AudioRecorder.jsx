import { useEffect, useRef, useState } from "react";

export default function AudioRecorder({ onRecorded }) {
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const [status, setStatus] = useState("idle"); // idle | recording
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      // cleanup stream when component unmounts
      if (mediaRef.current?.stream) {
        mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecorded?.(blob);
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setStatus("recording");
    } catch (e) {
      setError("Mic permission denied or not available.");
    }
  };

  const stop = () => {
    try {
      mediaRef.current?.stop();
    } catch {}
    setStatus("idle");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-white/80 font-medium">Audio Answer</p>
          <p className="text-white/60 text-sm">
            Record a short answer and upload it
          </p>
        </div>

        {status !== "recording" ? (
          <button
            onClick={start}
            className="bg-white text-black px-4 py-2 rounded-xl hover:scale-[1.02] transition"
          >
            🎙 Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {error ? <p className="mt-3 text-red-300 text-sm">{error}</p> : null}
      {status === "recording" ? (
        <p className="mt-3 text-green-300 text-sm">Recording… speak now.</p>
      ) : null}
    </div>
  );
}