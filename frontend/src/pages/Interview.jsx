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
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl w-full"
      >
        {loadingResume ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Resuming interview...
          </div>
        ) : !session ? (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Start Interview</h2>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setInterviewMode("domain")}
                className={`px-4 py-2 rounded-xl border transition ${
                  interviewMode === "domain"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                }`}
              >
                Domain Interview
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode("resume")}
                className={`px-4 py-2 rounded-xl border transition ${
                  interviewMode === "resume"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                }`}
              >
                Resume-Based Interview
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode("coding")}
                className={`px-4 py-2 rounded-xl border transition ${
                  interviewMode === "coding"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                }`}
              >
                Coding Interview
              </button>
            </div>

            {interviewMode === "domain" ? (
              <div className="grid gap-3">
                <label className="text-sm text-white/70">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-xl p-3"
                >
                  <option value="hr">HR</option>
                  <option value="java">Java</option>
                  <option value="dbms">DBMS</option>
                  <option value="ai">AI</option>
                </select>

                <label className="text-sm text-white/70 mt-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-xl p-3"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <div className="mt-2 flex items-center gap-3">
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

                <PrimaryButton
                  onClick={start}
                  disabled={loadingStart}
                  className="mt-4 px-6 py-3"
                >
                  {loadingStart ? "Starting..." : "Start"}
                </PrimaryButton>
              </div>
            ) : interviewMode === "resume" ? (
              <ResumeInterview
                onStart={(resumeSession) => {
                  setMsg("");
                  setFinalReport(null);
                  setAnswer("");
                  setVideoBlob(null);
                  setVideoMsg("");
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

            {msg && <p className="text-red-400 font-medium">{msg}</p>}
          </div>
        ) : finalReport ? (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">✅ Completed</h2>

            <p className="text-white/70">
              Total Score:{" "}
              <span className="text-white font-semibold">
                {finalReport.total_score ?? "—"}
              </span>
              {finalReport.average_score !== null &&
              finalReport.average_score !== undefined ? (
                <>
                  {" "}
                  | Avg:{" "}
                  <span className="text-white font-semibold">
                    {finalReport.average_score}
                  </span>
                </>
              ) : null}
            </p>

            <p className="text-white/70">
              Verdict:{" "}
              <span className="text-white font-semibold">
                {finalReport.verdict ?? "—"}
              </span>
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {sid ? (
                <>
                  <Link
                    to={`/insights?session_id=${encodeURIComponent(sid)}`}
                    className="bg-white text-black px-5 py-2 rounded-lg hover:scale-105 transition"
                  >
                    View Insights
                  </Link>

                  <Link
                    to={`/analytics?session_id=${encodeURIComponent(sid)}`}
                    className="border border-white/20 px-5 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    View Analytics
                  </Link>
                </>
              ) : null}

              <GhostButton onClick={start} className="px-5 py-2 rounded-lg">
                Start New Interview
              </GhostButton>
            </div>

            {finalReport?.detailed_report ? (
              <details className="pt-2">
                <summary className="cursor-pointer text-white/80">
                  See raw report
                </summary>
                <pre className="mt-2 text-xs bg-black/40 p-3 rounded-xl overflow-auto">
                  {JSON.stringify(finalReport, null, 2)}
                </pre>
              </details>
            ) : null}

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-white/70 text-sm">
                Session: <span className="text-white">{session.session_id}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`text-sm ${
                    secondsLeft <= 10 && !isPaused
                      ? "text-red-300"
                      : "text-white/70"
                  }`}
                >
                  Time left: <span className="text-white font-medium">{mm}:{ss}</span>
                  {isPaused ? <span className="ml-2 text-yellow-300">Paused</span> : null}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="h-8 w-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-sm"
                  title={isPaused ? "Resume timer" : "Pause timer"}
                >
                  {isPaused ? "▶" : "⏸"}
                </button>

                <GhostButton
                  type="button"
                  onClick={saveAndExit}
                  className="px-4 py-1.5 rounded-lg"
                >
                  Save & Exit
                </GhostButton>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">
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

            <p className="text-white/70">{session.question}</p>

            <div className="flex items-center gap-3">
              <input
                id="videoActive"
                type="checkbox"
                checked={enableVideo}
                onChange={(e) => setEnableVideo(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="videoActive" className="text-sm text-white/70">
                Use video interview mode
              </label>
            </div>

            {enableVideo ? (
              <VideoRecorder
                onRecordingComplete={(blob) => {
                  setVideoBlob(blob);
                  setVideoMsg("Video recorded successfully. You can now submit it.");
                }}
                onError={(errMsg) => {
                  setVideoMsg(errMsg);
                }}
              />
            ) : null}

            {videoMsg ? (
              <p className="text-sm text-white/60">{videoMsg}</p>
            ) : null}

            {videoBlob ? (
              <PrimaryButton
                onClick={() => submitVideo(videoBlob)}
                disabled={uploadingVideo || loadingSubmit || uploadingAudio}
                className="px-6 py-2 rounded-lg"
              >
                {uploadingVideo ? "Uploading Video..." : "Submit Recorded Video"}
              </PrimaryButton>
            ) : null}

            <AudioRecorder onRecorded={submitAudio} />
            {uploadingAudio ? (
              <p className="text-white/60 text-sm">Uploading audio...</p>
            ) : null}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Type your answer here..."
              disabled={loadingSubmit || uploadingAudio || uploadingVideo}
            />

            <div className="flex gap-3">
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

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        )}

        {showExitModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={cancelExit}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6">
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
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}