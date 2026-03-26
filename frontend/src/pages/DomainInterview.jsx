import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  startInterview,
  submitAnswer,
  getInterviewState,
} from "../api/interviewApi";
import api from "../api/axios";
import AudioRecorder from "../components/AudioRecorder";
import VideoRecorder from "../components/VideoRecorder";
import { PrimaryButton, GhostButton } from "../components/Buttons";

const SECONDS_PER_QUESTION = 240;

const DOMAINS = [
  { value: "hr", label: "HR" },
  { value: "java", label: "Java" },
  { value: "dbms", label: "DBMS" },
  { value: "ai", label: "AI" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[24px] border border-white/[0.09]",
        "bg-gradient-to-b from-white/[0.055] to-white/[0.018]",
        "backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CompactTimer({ secondsLeft, totalSeconds, isPaused, onTogglePause }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const dashOffset = circumference * (1 - progress);
  const danger = secondsLeft <= 20 && !isPaused;
  const color = danger ? "#ffffff" : "#ffffff";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2">
      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
        <svg className="absolute h-12 w-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease, stroke 0.2s ease",
            }}
          />
        </svg>
        <span className="font-mono text-[10px] font-black text-white">
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">
          Timer
        </p>
        <p className="text-sm font-semibold text-white/75">
          {isPaused ? "Paused" : "Running"}
        </p>
      </div>

      <button
        onClick={onTogglePause}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-xs text-white/60 transition-all hover:bg-white/[0.1] hover:text-white"
      >
        {isPaused ? "▶" : "⏸"}
      </button>
    </div>
  );
}

function CommunicationCard({ communication }) {
  if (!communication) return null;

  const metrics = [
    { label: "Pace", value: communication.pace_label || "—" },
    {
      label: "WPM",
      value: Number(communication.words_per_minute ?? 0).toFixed(1),
    },
    { label: "Fillers", value: communication.filler_count ?? 0 },
    { label: "Pauses", value: communication.pause_count ?? 0 },
    {
      label: "Comm Score",
      value: `${Number(communication.communication_score ?? 0).toFixed(2)}/10`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-5"
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
        Communication Analysis
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.08] bg-black/25 p-3"
          >
            <p className="mb-1 font-mono text-[10px] text-white/45">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DomainInterview() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const resumeSessionId = sp.get("session_id") || "";

  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [domain, setDomain] = useState("hr");
  const [difficulty, setDifficulty] = useState("easy");
  const [enableVideo, setEnableVideo] = useState(false);
  const [communication, setCommunication] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [timeUp, setTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);

  const autoSubmittedRef = useRef(false);
  const videoRecorderRef = useRef(null);
  const spokenQuestionKeyRef = useRef("");
  const activeSpeechIdRef = useRef(0);
  const workspaceRef = useRef(null);

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  const stopQuestionSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsReadingQuestion(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!session || finalReport || isPaused) return;
    if (secondsLeft <= 0) {
      setTimeUp(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [session, finalReport, isPaused, secondsLeft]);

  const applyInterviewResponse = (data, opts = {}) => {
    if (opts.communicationData) setCommunication(opts.communicationData);

    if (data.is_completed) {
      setFinalReport(data);
      return;
    }

    setSession((prev) => ({
      ...prev,
      question: data.question || prev?.question || "",
      question_index: data.question_index ?? prev?.question_index ?? 0,
      is_follow_up: !!data.is_follow_up,
    }));

    setSecondsLeft(SECONDS_PER_QUESTION);
    setTimeUp(false);
    autoSubmittedRef.current = false;
    setMsg(opts.successPrefix ? `${opts.successPrefix} – Next question loaded` : "");
  };

  const speakQuestion = (text, opts = {}) => {
    if (!speechSupported || !text) return;

    const id = ++activeSpeechIdRef.current;
    stopQuestionSpeech();

    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 0.96;
    utter.pitch = 1;
    utter.volume = 1;

    utter.onstart = () => {
      if (activeSpeechIdRef.current === id) setIsReadingQuestion(true);
    };

    utter.onend = utter.onerror = async () => {
      if (activeSpeechIdRef.current !== id) return;
      setIsReadingQuestion(false);
      if (opts.restartRecordingAfter) {
        try {
          await videoRecorderRef.current?.startRecording?.();
        } catch {}
      }
    };

    window.speechSynthesis.speak(utter);
  };

  const handleReadAgain = () => {
    if (isReadingQuestion) {
      stopQuestionSpeech();
      return;
    }
    speakQuestion(session?.question, { restartRecordingAfter: enableVideo });
  };

  const start = async () => {
    setLoadingStart(true);
    setMsg("");

    try {
      const res = await startInterview(domain, difficulty);
      const data = res.data;

      setSession({
        session_id: data.session_id,
        domain: data.domain,
        difficulty: data.difficulty,
        question_index: data.question_index ?? 0,
        question: data.question || "",
        is_follow_up: !!data.is_follow_up,
      });

      setSecondsLeft(SECONDS_PER_QUESTION);
      setTimeUp(false);
      setFinalReport(null);
      setAnswer("");
      setCommunication(null);
      autoSubmittedRef.current = false;
    } catch (err) {
      if (err?.response?.status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Failed to start interview");
    } finally {
      setLoadingStart(false);
    }
  };

  const submitTextOnly = async (forcedAnswer = null) => {
    if (!session?.session_id) return;

    setLoadingSubmit(true);
    setMsg("");
    stopQuestionSpeech();

    const payloadAnswer = forcedAnswer ?? answer.trim();

    try {
      const res = await submitAnswer(
        session.session_id,
        payloadAnswer || "(No answer)"
      );
      setAnswer("");
      applyInterviewResponse(res.data);
    } catch (err) {
      if (err?.response?.status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Submit failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    if (!timeUp || !session || finalReport || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    if (enableVideo) handleMainSubmit("(Time up)");
    else submitTextOnly("(Time up) " + ((answer || "").trim() || "(No answer)"));
  }, [timeUp]);

  const submitAudio = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start an interview first.");
      return;
    }

    setUploadingAudio(true);
    setMsg("");
    stopQuestionSpeech();

    try {
      const form = new FormData();
      form.append("session_id", session.session_id);
      form.append("file", blob, "answer.webm");

      const res = await api.post("/audio/submit-answer", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnswer("");
      applyInterviewResponse(res.data, {
        communicationData: res.data.communication || null,
        successPrefix: "Audio scored ✅",
      });
    } catch (err) {
      if (err?.response?.status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Audio submit failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  const submitVideoBlob = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start an interview first.");
      return;
    }

    setUploadingVideo(true);
    setMsg("Uploading and analyzing video…");
    stopQuestionSpeech();

    try {
      const form = new FormData();
      form.append("session_id", session.session_id);
      form.append("file", blob, "answer.webm");

      const res = await api.post("/video/submit-answer", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnswer("");
      applyInterviewResponse(res.data, {
        communicationData: res.data.communication || null,
        successPrefix: "Video scored ✅",
      });
    } catch (err) {
      if (err?.response?.status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Video submit failed");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMainSubmit = async () => {
    if (enableVideo) {
      if (!session?.session_id) {
        setMsg("Start an interview first.");
        return;
      }

      const recorder = videoRecorderRef.current;
      if (!recorder) {
        setMsg("Video recorder not ready.");
        return;
      }

      setMsg("");
      stopQuestionSpeech();

      try {
        const blob = await recorder.stopRecording();
        if (!blob || blob.size === 0) {
          setMsg("No video recorded. Please try again.");
          return;
        }
        await submitVideoBlob(blob);
      } catch {
        setMsg("Unable to submit video.");
      }
      return;
    }

    await submitTextOnly();
  };

  useEffect(() => {
    if (!enableVideo) {
      videoRecorderRef.current?.stopPreview?.();
      return;
    }

    if (!session || finalReport) return;

    const t = setTimeout(async () => {
      try {
        await videoRecorderRef.current?.startPreview?.();
        window.scrollTo({
          top: workspaceRef.current
            ? workspaceRef.current.getBoundingClientRect().top +
              window.scrollY -
              12
            : 160,
          behavior: "smooth",
        });
      } catch {
        setMsg("Unable to start video preview.");
      }
    }, 150);

    return () => clearTimeout(t);
  }, [enableVideo, session?.session_id, finalReport]);

  useEffect(() => {
    if (!session?.question || finalReport) return;

    const key = [
      session.session_id,
      session.question_index,
      session.is_follow_up ? "follow" : "main",
      enableVideo ? "video" : "normal",
    ].join("-");

    if (spokenQuestionKeyRef.current === key) return;
    spokenQuestionKeyRef.current = key;

    const t = setTimeout(
      () => speakQuestion(session.question, { restartRecordingAfter: enableVideo }),
      250
    );

    return () => clearTimeout(t);
  }, [
    session?.session_id,
    session?.question_index,
    session?.question,
    session?.is_follow_up,
    enableVideo,
    finalReport,
  ]);

  useEffect(() => {
    if (finalReport) {
      stopQuestionSpeech();
      videoRecorderRef.current?.stopPreview?.();
    }
  }, [finalReport]);

  useEffect(() => {
    if (!resumeSessionId) return;

    (async () => {
      setLoadingResume(true);
      setMsg("");

      try {
        const res = await getInterviewState(resumeSessionId);
        const data = res.data;

        if (data.is_completed) {
          setFinalReport(data);
          return;
        }

        if (!data.question) {
          setSession({
            session_id: data.session_id,
            domain: data.domain,
            difficulty: data.difficulty,
            question_index:
              data.current_question ?? data.current_question_index ?? 0,
            question: "",
            is_follow_up: false,
          });
        } else {
          setSession({
            session_id: data.session_id,
            domain: data.domain,
            difficulty: data.difficulty,
            question_index: data.question_index,
            question: data.question,
            is_follow_up: !!data.is_follow_up,
          });
        }
      } catch (err) {
        if (err?.response?.status === 401) return forceLogout();
        setMsg(err?.response?.data?.detail || "Failed to resume interview");
        setSp({});
      } finally {
        setLoadingResume(false);
      }
    })();
  }, [resumeSessionId]);

  const saveAndExit = () => setShowExitModal(true);
  const cancelExit = () => setShowExitModal(false);
  const confirmExit = () => {
    stopQuestionSpeech();
    videoRecorderRef.current?.stopPreview?.();
    nav("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 py-2"
    >
      {loadingResume && (
        <GlassCard className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-white/40">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Resuming interview…
          </div>
        </GlassCard>
      )}

      {!loadingResume && !session && (
        <GlassCard className="p-7 sm:p-9">
          <div
            className="absolute -right-12 top-0 h-48 w-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10 max-w-3xl">
            <div className="section-eyebrow mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              Domain Interview
            </div>

            <h2
              className="mb-4 text-4xl font-extrabold leading-[0.94] text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start Your Domain Interview
            </h2>

            <p className="mb-8 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
              Choose your domain and difficulty, then begin a guided AI-powered interview session.
            </p>

            <div className="mb-6 space-y-5 rounded-2xl border border-white/[0.08] bg-black/20 p-6">
              <div>
                <label className="mb-3 block font-mono text-[11px] uppercase tracking-widest text-white/40">
                  Domain
                </label>

                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDomain(d.value)}
                      className={[
                        "rounded-full px-5 py-2.5 text-sm font-bold transition-all",
                        domain === d.value
                          ? "border border-white/[0.16] bg-white/[0.08] text-white"
                          : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80",
                      ].join(" ")}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block font-mono text-[11px] uppercase tracking-widest text-white/40">
                  Difficulty
                </label>

                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={[
                        "rounded-full px-5 py-2.5 text-sm font-bold transition-all",
                        difficulty === d.value
                          ? "border border-white/[0.16] bg-white/[0.08] text-white"
                          : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80",
                      ].join(" ")}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setEnableVideo((v) => !v)}
                  className={[
                    "relative h-6 w-11 rounded-full border transition-all",
                    enableVideo
                      ? "border-white/[0.16] bg-white/[0.12]"
                      : "border-white/[0.1] bg-white/[0.06]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      enableVideo ? "left-5" : "left-0.5",
                    ].join(" ")}
                  />
                </button>

                <label
                  className="cursor-pointer text-sm text-white/65"
                  onClick={() => setEnableVideo((v) => !v)}
                >
                  Enable video interview mode
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <PrimaryButton onClick={start} disabled={loadingStart}>
                {loadingStart ? "Starting…" : "Start Interview"}
              </PrimaryButton>

              <GhostButton onClick={() => nav("/interview")}>
                Back to Modes
              </GhostButton>
            </div>

            {msg && <p className="mt-4 text-sm text-red-400">{msg}</p>}
          </div>
        </GlassCard>
      )}

      {!loadingResume && finalReport && (
        <GlassCard className="p-7">
          <div
            className="absolute -right-10 top-0 h-44 w-44 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M5 8l2 2 4-4" />
                </svg>
              </div>

              <div>
                <h2
                  className="text-2xl font-extrabold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Interview Completed
                </h2>
                <p className="text-sm text-white/45">
                  Session scored and summarized
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total Score", value: finalReport.total_score ?? "—" },
                { label: "Verdict", value: finalReport.verdict ?? "—" },
                { label: "Avg Score", value: finalReport.average_score ?? "—" },
                { label: "Domain", value: session?.domain?.toUpperCase() ?? "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.08] bg-black/20 p-4"
                >
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
                    {label}
                  </p>
                  <p
                    className="text-xl font-extrabold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {communication && <CommunicationCard communication={communication} />}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/insights?session_id=${encodeURIComponent(
                  session?.session_id || resumeSessionId || ""
                )}`}
              >
                <PrimaryButton>View Insights</PrimaryButton>
              </Link>

              <Link
                to={`/analytics?session_id=${encodeURIComponent(
                  session?.session_id || resumeSessionId || ""
                )}`}
              >
                <GhostButton>View Analytics</GhostButton>
              </Link>

              <GhostButton
                onClick={() => {
                  setSession(null);
                  setFinalReport(null);
                  setAnswer("");
                  setCommunication(null);
                }}
              >
                Start New Interview
              </GhostButton>
            </div>

            {finalReport?.detailed_report && (
              <details className="mt-5">
                <summary className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/80">
                  See raw report
                </summary>
                <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/[0.08] bg-black/35 p-4 font-mono text-[11px] text-white/60">
                  {JSON.stringify(finalReport, null, 2)}
                </pre>
              </details>
            )}

            {msg && <p className="mt-4 text-sm text-emerald-400">{msg}</p>}
          </div>
        </GlassCard>
      )}

      {!loadingResume && session && !finalReport && (
        <div ref={workspaceRef} className="space-y-4">
          <GlassCard className="overflow-hidden">
            <div className="border-b border-white/[0.07] bg-white/[0.02] px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      className="text-3xl font-extrabold text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Q
                      {session.is_follow_up
                        ? `${(session.question_index ?? 0) + 1}.1`
                        : (session.question_index ?? 0) + 1}
                    </span>

                    {session.is_follow_up && (
                      <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/80">
                        Follow-up
                      </span>
                    )}

                    {session.domain && (
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase text-white/45">
                        {session.domain}
                      </span>
                    )}

                    {session.difficulty && (
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase text-white/75">
                        {session.difficulty}
                      </span>
                    )}

                    {speechSupported && (
                      <button
                        onClick={handleReadAgain}
                        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/50 transition-all hover:text-white"
                      >
                        {isReadingQuestion ? "Reading…" : "Read Again"}
                      </button>
                    )}
                  </div>

                  <p className="max-w-4xl text-base leading-7 text-white/82">
                    {session.question || "Loading question…"}
                  </p>

                  <p className="mt-2 font-mono text-[11px] text-white/30">
                    {isReadingQuestion
                      ? "AI is reading the question…"
                      : "Question auto-reads on each new round. Use earphones for cleaner capture."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Answer Panel
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  <CompactTimer
                    secondsLeft={secondsLeft}
                    totalSeconds={SECONDS_PER_QUESTION}
                    isPaused={isPaused}
                    onTogglePause={() => setIsPaused((p) => !p)}
                  />

                  <label className="flex cursor-pointer items-center gap-2">
                    <button
                      onClick={() => setEnableVideo((v) => !v)}
                      className={[
                        "relative h-5 w-9 flex-shrink-0 rounded-full border transition-all",
                        enableVideo
                          ? "border-white/[0.16] bg-white/[0.12]"
                          : "border-white/[0.1] bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                          enableVideo ? "left-4" : "left-0.5",
                        ].join(" ")}
                      />
                    </button>
                    <span className="text-xs text-white/50">Video</span>
                  </label>

                  {communication && (
                    <button
                      onClick={() => setCommunication(null)}
                      className="font-mono text-xs text-white/35 transition-colors hover:text-white/60"
                    >
                      Clear comm
                    </button>
                  )}

                  <GhostButton onClick={saveAndExit}>Save & Exit</GhostButton>

                  <PrimaryButton
                    onClick={() => handleMainSubmit()}
                    disabled={
                      loadingSubmit ||
                      uploadingAudio ||
                      uploadingVideo ||
                      isReadingQuestion
                    }
                  >
                    {isReadingQuestion
                      ? "Reading…"
                      : uploadingVideo
                      ? "Uploading…"
                      : loadingSubmit
                      ? "Submitting…"
                      : "Submit Answer"}
                  </PrimaryButton>
                </div>
              </div>

              {communication && (
                <div className="mb-4">
                  <CommunicationCard communication={communication} />
                </div>
              )}

              {enableVideo ? (
                <div className="mt-2">
                  <VideoRecorder
                    ref={videoRecorderRef}
                    autoStartPreview={true}
                    onError={(errMsg) => setMsg(errMsg)}
                  />
                  <p className="mt-2 font-mono text-[11px] text-white/35">
                    Question is read first. Recording starts after the voice ends.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <AudioRecorder onRecorded={submitAudio} />
                    {uploadingAudio && (
                      <p className="mt-2 font-mono text-xs text-white/45">
                        Uploading audio…
                      </p>
                    )}
                  </div>

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={6}
                    placeholder="Type your answer here…"
                    disabled={loadingSubmit || uploadingAudio || uploadingVideo}
                    className="w-full resize-none rounded-2xl border border-white/[0.09] bg-white/[0.04] p-4 font-body text-sm leading-7 text-white/85 placeholder:text-white/25 transition-all focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/[0.08] disabled:opacity-50"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </>
              )}

              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300"
                >
                  {msg}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={cancelExit}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md rounded-[28px] border border-white/[0.1] bg-[#0d0d18] p-7 shadow-2xl"
              style={{ backdropFilter: "blur(40px)" }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M9 4l5 4-5 4M2 8h12" />
                  <path d="M2 4v8" />
                </svg>
              </div>

              <h3
                className="mb-2 text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Save and exit?
              </h3>

              <p className="mb-6 text-sm text-white/55">
                Your progress is saved. You can continue later from the dashboard.
              </p>

              <div className="flex justify-end gap-3">
                <GhostButton onClick={cancelExit}>Stay Here</GhostButton>
                <PrimaryButton onClick={confirmExit}>Go to Dashboard</PrimaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}