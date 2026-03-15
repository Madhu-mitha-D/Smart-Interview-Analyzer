import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
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

function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function CompactTimer({ secondsLeft, totalSeconds, isPaused, onTogglePause }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const dashOffset = circumference * (1 - progress);
  const danger = secondsLeft <= 20 && !isPaused;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg className="-rotate-90 h-12 w-12">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={danger ? "rgba(252,165,165,0.95)" : "rgba(255,255,255,0.9)"}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.2s ease" }}
          />
        </svg>

        <div className="absolute text-center">
          <div
            className={`text-[10px] font-semibold ${
              danger ? "text-red-300" : "text-white"
            }`}
          >
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          Timer
        </p>
        <p className={`text-sm ${danger ? "text-red-300" : "text-white/75"}`}>
          {isPaused ? "Paused" : "Running"}
        </p>
      </div>

      <button
        type="button"
        onClick={onTogglePause}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm transition hover:bg-white/10"
        title={isPaused ? "Resume timer" : "Pause timer"}
      >
        {isPaused ? "▶" : "⏸"}
      </button>
    </div>
  );
}

function CommunicationCard({ communication }) {
  if (!communication) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <h3 className="text-lg font-semibold text-white">
        Communication Analysis
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/60">Speaking Pace</p>
          <p className="mt-1 text-base font-semibold text-white">
            {communication.pace_label || "—"}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/60">Words / Min</p>
          <p className="mt-1 text-base font-semibold text-white">
            {Number(communication.words_per_minute ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/60">Filler Words</p>
          <p className="mt-1 text-base font-semibold text-white">
            {communication.filler_count ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/60">Pause Count</p>
          <p className="mt-1 text-base font-semibold text-white">
            {communication.pause_count ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-white/60">Comm. Score</p>
          <p className="mt-1 text-base font-semibold text-white">
            {Number(communication.communication_score ?? 0).toFixed(2)} / 10
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/55">
        Based on transcript length, speech duration, fillers, and speaking pace.
      </p>
    </div>
  );
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.03)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
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

  const startVideoRecordingSafely = async () => {
    if (!enableVideo || !session || finalReport) return;
    try {
      await videoRecorderRef.current?.startRecording?.();
    } catch {
      setMsg("Unable to start video recording.");
    }
  };

  const speakQuestion = async (
    questionText,
    { restartRecordingAfter = false } = {}
  ) => {
    if (!questionText?.trim()) return;

    if (!speechSupported || typeof window === "undefined") {
      if (restartRecordingAfter) {
        await startVideoRecordingSafely();
      }
      return;
    }

    stopQuestionSpeech();
    const speechId = Date.now();
    activeSpeechIdRef.current = speechId;

    if (restartRecordingAfter && videoRecorderRef.current?.isRecording?.()) {
      try {
        await videoRecorderRef.current.stopRecording();
      } catch {}
    }

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsReadingQuestion(true);
    };

    utterance.onend = async () => {
      if (activeSpeechIdRef.current !== speechId) return;
      setIsReadingQuestion(false);

      if (restartRecordingAfter) {
        await startVideoRecordingSafely();
      }
    };

    utterance.onerror = async () => {
      if (activeSpeechIdRef.current !== speechId) return;
      setIsReadingQuestion(false);

      if (restartRecordingAfter) {
        await startVideoRecordingSafely();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleReadAgain = async () => {
    if (!session?.question) return;
    setMsg("");
    await speakQuestion(session.question, {
      restartRecordingAfter: enableVideo,
    });
  };

  const saveAndExit = () => {
    stopQuestionSpeech();
    setIsPaused(true);
    setShowExitModal(true);
  };

  const confirmExit = async () => {
    try {
      stopQuestionSpeech();
      await videoRecorderRef.current?.stopPreview?.();
    } catch {}
    setShowExitModal(false);
    nav("/dashboard");
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  const applyInterviewResponse = (data, options = {}) => {
    const { communicationData = null, successPrefix = "" } = options;

    if (communicationData) {
      setCommunication(communicationData);
    } else {
      setCommunication(null);
    }

    if (data.finished) {
      setFinalReport(data);
      stopQuestionSpeech();
      setMsg("🎉 Interview Finished!");
      return;
    }

    setSession((prev) => ({
      ...prev,
      question_index: data.next_question_index,
      question: data.next_question,
      difficulty: data.current_difficulty || prev.difficulty,
      is_follow_up: !!data.is_follow_up,
    }));

    if (data.is_follow_up) {
      setMsg("Follow-up question generated.");
    } else {
      const prefix = successPrefix ? `${successPrefix} ` : "";
      setMsg(
        `${prefix}Score: ${data.score} | Similarity: ${Number(
          data.similarity
        ).toFixed(2)}`
      );
    }
  };

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );

    return () => {
      stopQuestionSpeech();
    };
  }, []);

  useEffect(() => {
    if (!session || finalReport) return;
    setSecondsLeft(SECONDS_PER_QUESTION);
    setTimeUp(false);
    setIsPaused(false);
    setShowExitModal(false);
    autoSubmittedRef.current = false;
    setCommunication(null);
  }, [session?.session_id, session?.question_index, finalReport]);

  useEffect(() => {
    if (!session || finalReport || isPaused || isReadingQuestion) return;

    if (secondsLeft <= 0) {
      setTimeUp(true);
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, session, finalReport, isPaused, isReadingQuestion]);

  const start = async () => {
    setMsg("");
    setFinalReport(null);
    setSession(null);
    setAnswer("");
    setCommunication(null);
    setLoadingStart(true);
    stopQuestionSpeech();

    try {
      const res = await startInterview(domain, difficulty);
      setSession({
        ...res.data,
        is_follow_up: false,
      });
      setSp({});
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Failed to start interview");
    } finally {
      setLoadingStart(false);
    }
  };

  const submitTextOnly = async (forcedAnswer) => {
    if (!session) return;

    const payloadAnswer =
      typeof forcedAnswer === "string"
        ? forcedAnswer.trim()
        : (answer || "").trim();

    if (forcedAnswer === undefined && !payloadAnswer) {
      setMsg("⚠️ Type an answer before submitting.");
      return;
    }

    setMsg("");
    setLoadingSubmit(true);
    stopQuestionSpeech();

    try {
      const res = await submitAnswer(session.session_id, payloadAnswer || "(No answer)");
      setAnswer("");
      applyInterviewResponse(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Submit failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  useEffect(() => {
    if (!timeUp || !session || finalReport) return;
    if (autoSubmittedRef.current) return;

    autoSubmittedRef.current = true;

    if (enableVideo) {
      handleMainSubmit("(Time up)");
    } else {
      submitTextOnly("(Time up) " + ((answer || "").trim() || "(No answer)"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  const submitAudio = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start/resume an interview before sending audio.");
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
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Audio submit failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  const submitVideoBlob = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start/resume an interview before sending video.");
      return;
    }

    setUploadingVideo(true);
    setMsg("Uploading and analyzing video...");
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
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Video submit failed");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMainSubmit = async (forcedPrefix = "") => {
    if (enableVideo) {
      if (!session?.session_id) {
        setMsg("Start an interview first.");
        return;
      }

      const recorder = videoRecorderRef.current;
      if (!recorder) {
        setMsg("Video recorder is not ready.");
        return;
      }

      setMsg("");
      stopQuestionSpeech();

      try {
        const blob = await recorder.stopRecording();

        if (!blob || blob.size === 0) {
          setMsg("No video was recorded for this answer. Please try again.");
          return;
        }

        await submitVideoBlob(blob);
      } catch {
        setMsg(
          forcedPrefix
            ? `${forcedPrefix} Unable to submit video answer.`
            : "Unable to submit video answer."
        );
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

    const timer = setTimeout(async () => {
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

    return () => clearTimeout(timer);
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

    const timer = setTimeout(() => {
      speakQuestion(session.question, {
        restartRecordingAfter: enableVideo,
      });
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setFinalReport(null);
      setAnswer("");
      setCommunication(null);
      stopQuestionSpeech();

      try {
        const res = await getInterviewState(resumeSessionId);
        const data = res.data;

        if (data.finished) {
          setFinalReport({
            finished: true,
            message: "Interview already completed",
            total_score: data.total_score,
            verdict: data.verdict,
            average_score: null,
          });

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
        const status = err?.response?.status;
        if (status === 401) return forceLogout();
        setMsg(err?.response?.data?.detail || "Failed to resume interview");
        setSp({});
      } finally {
        setLoadingResume(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSessionId]);

  return (
    <div className="min-h-screen px-4 py-4 text-white sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl"
      >
        {loadingResume ? (
          <Surface className="p-8 text-white/70">Resuming interview...</Surface>
        ) : !session ? (
          <Surface className="p-6 sm:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                Domain interview
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start your domain interview
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
                Choose your interview domain and difficulty, then begin a guided
                AI-powered interview session.
              </p>
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-white/70">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <option value="hr">HR</option>
                  <option value="java">Java</option>
                  <option value="dbms">DBMS</option>
                  <option value="ai">AI</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/70">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                id="videoMode"
                type="checkbox"
                checked={enableVideo}
                onChange={(e) => setEnableVideo(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="videoMode" className="text-sm text-white/70">
                Enable video interview mode
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton
                onClick={start}
                disabled={loadingStart}
                className="px-6 py-3"
              >
                {loadingStart ? "Starting..." : "Start Interview"}
              </PrimaryButton>

              <GhostButton onClick={() => nav("/interview")}>
                Back to Interview Modes
              </GhostButton>
            </div>

            {msg ? <p className="mt-5 text-red-400 font-medium">{msg}</p> : null}
          </Surface>
        ) : finalReport ? (
          <Surface className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">✅ Interview Completed</h2>
                <p className="mt-2 text-white/65">
                  Your session has been scored and summarized.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-white/60">Total Score</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {finalReport.total_score ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-white/60">Verdict</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {finalReport.verdict ?? "—"}
                </p>
                {finalReport.average_score !== null &&
                finalReport.average_score !== undefined ? (
                  <p className="mt-2 text-sm text-white/55">
                    Average: {finalReport.average_score}
                  </p>
                ) : null}
              </div>
            </div>

            {communication ? (
              <CommunicationCard communication={communication} />
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/insights?session_id=${encodeURIComponent(
                  session?.session_id || resumeSessionId || ""
                )}`}
                className="rounded-xl bg-white px-5 py-2 text-black transition hover:scale-[1.03]"
              >
                View Insights
              </Link>

              <Link
                to={`/analytics?session_id=${encodeURIComponent(
                  session?.session_id || resumeSessionId || ""
                )}`}
                className="rounded-xl border border-white/20 px-5 py-2 transition hover:bg-white/10"
              >
                View Analytics
              </Link>

              <GhostButton onClick={start} className="px-5 py-2">
                Start New Interview
              </GhostButton>
            </div>

            {finalReport?.detailed_report ? (
              <details>
                <summary className="cursor-pointer text-white/80">
                  See raw report
                </summary>
                <pre className="mt-3 overflow-auto rounded-2xl bg-black/40 p-4 text-xs">
                  {JSON.stringify(finalReport, null, 2)}
                </pre>
              </details>
            ) : null}

            {msg ? <p className="text-green-400 font-medium">{msg}</p> : null}
          </Surface>
        ) : (
          <div ref={workspaceRef} className="space-y-4">
            <Surface className="overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl font-semibold text-white">
                        {session.is_follow_up
                          ? `Q${(session.question_index ?? 0) + 1}.1`
                          : `Q${(session.question_index ?? 0) + 1}`}
                      </h2>

                      {session.is_follow_up ? (
                        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                          Follow-up
                        </span>
                      ) : null}

                      {speechSupported ? (
                        <GhostButton
                          type="button"
                          onClick={handleReadAgain}
                          className="px-4 py-2"
                        >
                          {isReadingQuestion ? "Reading..." : "Read Again"}
                        </GhostButton>
                      ) : null}
                    </div>

                    <p className="mt-3 max-w-4xl text-base leading-7 text-white/78">
                      {session.question}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/50">
                      <span>
                        {isReadingQuestion
                          ? "AI is reading the question..."
                          : "Question auto-reads on each new round."}
                      </span>
                      <span>Use earphones for cleaner answer capture.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Answer Panel</h3>

                  <div className="flex flex-wrap items-center gap-3">
                    <CompactTimer
                      secondsLeft={secondsLeft}
                      totalSeconds={SECONDS_PER_QUESTION}
                      isPaused={isPaused}
                      onTogglePause={() => setIsPaused((prev) => !prev)}
                    />

                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        id="videoActive"
                        type="checkbox"
                        checked={enableVideo}
                        onChange={(e) => setEnableVideo(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Use video mode
                    </label>

                    {communication ? (
                      <GhostButton
                        type="button"
                        onClick={() => setCommunication(null)}
                        className="px-4 py-2"
                      >
                        Clear Comm Card
                      </GhostButton>
                    ) : null}

                    <GhostButton
                      type="button"
                      onClick={saveAndExit}
                      className="px-4 py-2"
                    >
                      Save & Exit
                    </GhostButton>

                    <PrimaryButton
                      onClick={() => handleMainSubmit()}
                      disabled={
                        loadingSubmit ||
                        uploadingAudio ||
                        uploadingVideo ||
                        isReadingQuestion
                      }
                      className="px-6 py-2.5 rounded-lg"
                    >
                      {isReadingQuestion
                        ? "Reading Question..."
                        : uploadingVideo
                        ? "Submitting Video..."
                        : loadingSubmit
                        ? "Submitting..."
                        : "Submit"}
                    </PrimaryButton>
                  </div>
                </div>

                {communication ? (
                  <div className="mt-4">
                    <CommunicationCard communication={communication} />
                  </div>
                ) : null}

                {enableVideo ? (
                  <div className="mt-4">
                    <VideoRecorder
                      ref={videoRecorderRef}
                      autoStartPreview={true}
                      onError={(errMsg) => {
                        setMsg(errMsg);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mt-4">
                      <AudioRecorder onRecorded={submitAudio} />
                      {uploadingAudio ? (
                        <p className="mt-2 text-sm text-white/60">
                          Uploading audio...
                        </p>
                      ) : null}
                    </div>

                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={5}
                      className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-4 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="Type your answer here..."
                      disabled={loadingSubmit || uploadingAudio || uploadingVideo}
                    />
                  </>
                )}

                {enableVideo ? (
                  <p className="mt-2 text-xs text-white/50">
                    Question is read first. Recording starts after the voice ends.
                  </p>
                ) : null}

                {msg ? (
                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {msg}
                  </div>
                ) : null}
              </div>
            </Surface>
          </div>
        )}

        {showExitModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/70" onClick={cancelExit} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6"
            >
              <h3 className="text-xl font-semibold">Save and exit interview?</h3>
              <p className="mt-2 text-sm text-white/70">
                Your current interview progress is saved. You can continue later
                from the dashboard.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <GhostButton type="button" onClick={cancelExit}>
                  Stay Here
                </GhostButton>
                <PrimaryButton type="button" onClick={confirmExit}>
                  Go to Dashboard
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}