import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import AudioRecorder from "../components/AudioRecorder";
import VideoRecorder from "../components/VideoRecorder";
import ResumeInterview from "../components/ResumeInterview";
import CodingInterview from "../components/CodingInterview";
import { PrimaryButton, GhostButton } from "../components/Buttons";

const SECONDS_PER_QUESTION = 240;

function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function TimerRing({ secondsLeft, totalSeconds, isPaused }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const dashOffset = circumference * (1 - progress);

  const danger = secondsLeft <= 20 && !isPaused;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="-rotate-90 h-24 w-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={danger ? "rgba(252,165,165,0.95)" : "rgba(255,255,255,0.9)"}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.2s ease" }}
        />
      </svg>

      <div className="absolute text-center">
        <div className={`text-sm font-semibold ${danger ? "text-red-300" : "text-white"}`}>
          {formatTime(secondsLeft)}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
          {isPaused ? "Paused" : "Live"}
        </div>
      </div>
    </div>
  );
}

function ModeCard({ active, title, desc, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-white/25 bg-white/10 shadow-[0_0_28px_rgba(255,255,255,0.06)]"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/60">{desc}</p>
    </motion.button>
  );
}

function CommunicationCard({ communication }) {
  if (!communication) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <h3 className="text-lg font-semibold text-white">Communication Analysis</h3>

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

function AmbientOrb() {
  return (
    <div className="pointer-events-none absolute right-[-30px] top-[-20px] hidden h-48 w-48 md:block">
      <motion.div
        animate={{
          y: [0, -10, 0],
          x: [0, 8, 0],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 48%, transparent 72%)",
        }}
      />
    </div>
  );
}

export default function Interview() {
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
  const [interviewMode, setInterviewMode] = useState("domain");

  const [enableVideo, setEnableVideo] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoMsg, setVideoMsg] = useState("");

  const [communication, setCommunication] = useState(null);

  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [timeUp, setTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const autoSubmittedRef = useRef(false);

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  const saveAndExit = () => {
    setIsPaused(true);
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    nav("/");
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  useEffect(() => {
    if (!session || finalReport) return;
    setSecondsLeft(SECONDS_PER_QUESTION);
    setTimeUp(false);
    setIsPaused(false);
    setShowExitModal(false);
    autoSubmittedRef.current = false;
    setVideoBlob(null);
    setVideoMsg("");
    setCommunication(null);
  }, [session?.session_id, session?.question_index, finalReport]);

  useEffect(() => {
    if (!session || finalReport || isPaused) return;

    if (secondsLeft <= 0) {
      setTimeUp(true);
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, session, finalReport, isPaused]);

  const start = async () => {
    setMsg("");
    setFinalReport(null);
    setSession(null);
    setAnswer("");
    setVideoBlob(null);
    setVideoMsg("");
    setCommunication(null);
    setLoadingStart(true);

    try {
      const res = await api.post("/start-interview", { domain, difficulty });
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

  const submit = async (forcedAnswer) => {
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

    try {
      const res = await api.post("/submit-answer", {
        session_id: session.session_id,
        answer: payloadAnswer || "(No answer)",
      });

      setAnswer("");
      setVideoBlob(null);
      setVideoMsg("");
      setCommunication(null);

      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
          difficulty: res.data.current_difficulty || prev.difficulty,
          is_follow_up: !!res.data.is_follow_up,
        }));

        if (res.data.is_follow_up) {
          setMsg("Follow-up question generated.");
        } else {
          setMsg(
            `Score: ${res.data.score} | Similarity: ${Number(
              res.data.similarity
            ).toFixed(2)}`
          );
        }
      }
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
    submit("(Time up) " + ((answer || "").trim() || "(No answer)"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  const submitAudio = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start/resume an interview before sending audio.");
      return;
    }

    setUploadingAudio(true);
    setMsg("");

    try {
      const form = new FormData();
      form.append("session_id", session.session_id);
      form.append("file", blob, "answer.webm");

      const res = await api.post("/audio/submit-answer", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoBlob(null);
      setVideoMsg("");
      setCommunication(res.data.communication || null);

      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
          difficulty: res.data.current_difficulty || prev.difficulty,
          is_follow_up: !!res.data.is_follow_up,
        }));

        if (res.data.is_follow_up) {
          setMsg("Follow-up question generated.");
        } else {
          setMsg(
            `Audio scored ✅ Score: ${res.data.score} | Similarity: ${Number(
              res.data.similarity
            ).toFixed(2)}`
          );
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Audio submit failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  const submitVideo = async (blob) => {
    if (!session?.session_id) {
      setMsg("Start/resume an interview before sending video.");
      return;
    }

    setUploadingVideo(true);
    setMsg("");

    try {
      const form = new FormData();
      form.append("session_id", session.session_id);
      form.append("file", blob, "answer.webm");

      const res = await api.post("/video/submit-answer", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoBlob(null);
      setVideoMsg("");
      setCommunication(null);

      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
          difficulty: res.data.current_difficulty || prev.difficulty,
          is_follow_up: !!res.data.is_follow_up,
        }));

        if (res.data.is_follow_up) {
          setMsg("Follow-up question generated.");
        } else {
          setMsg(
            `Video scored ✅ Score: ${res.data.score} | Similarity: ${Number(
              res.data.similarity
            ).toFixed(2)}`
          );
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Video submit failed");
    } finally {
      setUploadingVideo(false);
    }
  };

  useEffect(() => {
    if (!resumeSessionId) return;

    (async () => {
      setLoadingResume(true);
      setMsg("");
      setFinalReport(null);
      setAnswer("");
      setVideoBlob(null);
      setVideoMsg("");
      setCommunication(null);

      try {
        const res = await api.get(
          `/interviews/${encodeURIComponent(resumeSessionId)}/state`
        );
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

  const sid = session?.session_id || resumeSessionId;

  return (
    <div className="min-h-screen px-6 py-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-5xl"
      >
        {loadingResume ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
            Resuming interview...
          </div>
        ) : !session ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-6 shadow-[0_0_40px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-8">
            <AmbientOrb />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                AI interview workspace
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start your interview session
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                Choose an interview type and begin practicing with adaptive questions,
                audio analysis, coding rounds, and performance feedback.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ModeCard
                  active={interviewMode === "domain"}
                  title="Domain Interview"
                  desc="Practice core interview questions by domain with adaptive difficulty."
                  onClick={() => setInterviewMode("domain")}
                />
                <ModeCard
                  active={interviewMode === "resume"}
                  title="Resume-Based Interview"
                  desc="Get personalized questions based on your own resume and profile."
                  onClick={() => setInterviewMode("resume")}
                />
                <ModeCard
                  active={interviewMode === "coding"}
                  title="Coding Interview"
                  desc="Solve coding questions in an interview-like environment with timing."
                  onClick={() => setInterviewMode("coding")}
                />
              </div>

              <div className="mt-8">
                {interviewMode === "domain" ? (
                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
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

                    <div className="mt-1 flex items-center gap-3">
                      <input
                        id="videoMode"
                        type="checkbox"
                        checked={enableVideo}
                        onChange={(e) => setEnableVideo(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="videoMode" className="text-sm text-white/70">
                        Enable video interview preview
                      </label>
                    </div>

                    <div className="mt-2">
                      <PrimaryButton
                        onClick={start}
                        disabled={loadingStart}
                        className="px-6 py-3"
                      >
                        {loadingStart ? "Starting..." : "Start Interview"}
                      </PrimaryButton>
                    </div>
                  </div>
                ) : interviewMode === "resume" ? (
                  <ResumeInterview
                    onStart={(resumeSession) => {
                      setMsg("");
                      setFinalReport(null);
                      setAnswer("");
                      setVideoBlob(null);
                      setVideoMsg("");
                      setCommunication(null);
                      setSession({
                        ...resumeSession,
                        is_follow_up: false,
                      });
                      setSp({});
                    }}
                  />
                ) : (
                  <CodingInterview />
                )}
              </div>

              {msg && <p className="mt-5 text-red-400 font-medium">{msg}</p>}
            </div>
          </div>
        ) : finalReport ? (
          <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(255,255,255,0.03)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">✅ Interview Completed</h2>
                <p className="mt-2 text-white/65">
                  Your session has been scored and summarized.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/70">
                Session: <span className="text-white">{sid || "—"}</span>
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

            {communication ? <CommunicationCard communication={communication} /> : null}

            <div className="flex flex-wrap gap-3">
              {sid ? (
                <>
                  <Link
                    to={`/insights?session_id=${encodeURIComponent(sid)}`}
                    className="rounded-xl bg-white px-5 py-2 text-black transition hover:scale-[1.03]"
                  >
                    View Insights
                  </Link>

                  <Link
                    to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                    className="rounded-xl border border-white/20 px-5 py-2 transition hover:bg-white/10"
                  >
                    View Analytics
                  </Link>
                </>
              ) : null}

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

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-semibold">
                        {session.is_follow_up
                          ? `Q${(session.question_index ?? 0) + 1}.1`
                          : `Q${(session.question_index ?? 0) + 1}`}
                      </h2>

                      {session.is_follow_up ? (
                        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                          Follow-up
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">
                      {session.question}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/65">
                    Session
                    <div className="mt-1 max-w-[220px] break-all text-white/90">
                      {session.session_id}
                    </div>
                  </div>
                </div>
              </div>

              {communication ? <CommunicationCard communication={communication} /> : null}

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Answer Panel</h3>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        id="videoActive"
                        type="checkbox"
                        checked={enableVideo}
                        onChange={(e) => setEnableVideo(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="videoActive" className="text-sm text-white/70">
                        Use video mode
                      </label>
                    </div>

                    <GhostButton
                      type="button"
                      onClick={saveAndExit}
                      className="px-4 py-2"
                    >
                      Save & Exit
                    </GhostButton>
                  </div>
                </div>

                {enableVideo ? (
                  <div className="mt-5">
                    <VideoRecorder
                      onRecordingComplete={(blob) => {
                        setVideoBlob(blob);
                        setVideoMsg("Video recorded successfully. You can now submit it.");
                      }}
                      onError={(errMsg) => {
                        setVideoMsg(errMsg);
                      }}
                    />
                  </div>
                ) : null}

                {videoMsg ? (
                  <p className="mt-3 text-sm text-white/60">{videoMsg}</p>
                ) : null}

                {videoBlob ? (
                  <PrimaryButton
                    onClick={() => submitVideo(videoBlob)}
                    disabled={uploadingVideo || loadingSubmit || uploadingAudio}
                    className="mt-4 px-6 py-2 rounded-lg"
                  >
                    {uploadingVideo ? "Uploading Video..." : "Submit Recorded Video"}
                  </PrimaryButton>
                ) : null}

                <div className="mt-5">
                  <AudioRecorder onRecorded={submitAudio} />
                  {uploadingAudio ? (
                    <p className="mt-2 text-sm text-white/60">Uploading audio...</p>
                  ) : null}
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={7}
                  className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 p-4 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Type your answer here..."
                  disabled={loadingSubmit || uploadingAudio || uploadingVideo}
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <PrimaryButton
                    onClick={() => submit()}
                    disabled={loadingSubmit || uploadingAudio || uploadingVideo}
                    className="px-6 py-2 rounded-lg"
                  >
                    {loadingSubmit ? "Submitting..." : "Submit"}
                  </PrimaryButton>

                  <GhostButton
                    onClick={() => nav("/")}
                    className="px-6 py-2 rounded-lg"
                  >
                    Back
                  </GhostButton>
                </div>

                {msg ? <p className="mt-4 text-green-400 font-medium">{msg}</p> : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <p className="text-sm uppercase tracking-[0.18em] text-white/45">
                  Time Remaining
                </p>

                <div className="mt-5 flex justify-center">
                  <TimerRing
                    secondsLeft={secondsLeft}
                    totalSeconds={SECONDS_PER_QUESTION}
                    isPaused={isPaused}
                  />
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm transition hover:bg-white/10"
                    title={isPaused ? "Resume timer" : "Pause timer"}
                  >
                    {isPaused ? "▶" : "⏸"}
                  </button>

                  <span className={`text-sm ${secondsLeft <= 20 && !isPaused ? "text-red-300" : "text-white/60"}`}>
                    {isPaused ? "Timer is paused" : "Timer is running"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <h3 className="text-lg font-semibold">Interview Tips</h3>
                <div className="mt-4 space-y-3 text-sm text-white/65">
                  <p>• Answer the core point first, then support it with a clear example.</p>
                  <p>• Keep your answer structured and avoid drifting away from the question.</p>
                  <p>• For behavioral questions, use STAR: Situation → Task → Action → Result.</p>
                  <p>• Speak clearly and naturally if you use audio mode.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                <h3 className="text-lg font-semibold">Session Controls</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <GhostButton
                    type="button"
                    onClick={saveAndExit}
                    className="px-5 py-2"
                  >
                    Save & Exit
                  </GhostButton>

                  <GhostButton
                    type="button"
                    onClick={() => setCommunication(null)}
                    className="px-5 py-2"
                  >
                    Clear Comm Card
                  </GhostButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExitModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={cancelExit}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6"
            >
              <h3 className="text-xl font-semibold">Save and exit interview?</h3>
              <p className="mt-2 text-sm text-white/70">
                Your current interview progress is saved. You can continue later from the dashboard.
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