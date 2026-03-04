import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import AudioRecorder from "../components/AudioRecorder";
import { PrimaryButton, GhostButton, DangerButton } from "../components/Buttons";

const SECONDS_PER_QUESTION = 90;

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

  const [finalReport, setFinalReport] = useState(null);

  // Choose domain/difficulty (used only when starting new)
  const [domain, setDomain] = useState("hr");
  const [difficulty, setDifficulty] = useState("easy");

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [timeUp, setTimeUp] = useState(false);
  const autoSubmittedRef = useRef(false);

  const forceLogout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  // Reset timer whenever question changes / new session starts
  useEffect(() => {
    if (!session || finalReport) return;
    setSecondsLeft(SECONDS_PER_QUESTION);
    setTimeUp(false);
    autoSubmittedRef.current = false;
  }, [session?.session_id, session?.question_index, finalReport]);

  // Countdown tick
  useEffect(() => {
    if (!session || finalReport) return;

    if (secondsLeft <= 0) {
      setTimeUp(true);
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, session, finalReport]);

  const start = async () => {
    setMsg("");
    setFinalReport(null);
    setSession(null);
    setAnswer("");
    setLoadingStart(true);

    try {
      const res = await api.post("/start-interview", { domain, difficulty });
      setSession(res.data);
      setSp({}); // clear resume query
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

    // If manual submit and empty -> block
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

      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
          // keep if backend changes difficulty adaptively
          difficulty: res.data.current_difficulty || prev.difficulty,
        }));

        setMsg(
          `Score: ${res.data.score} | Similarity: ${Number(
            res.data.similarity
          ).toFixed(2)}`
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Submit failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Auto-submit ONCE when time is up
  useEffect(() => {
    if (!timeUp || !session || finalReport) return;
    if (autoSubmittedRef.current) return;

    autoSubmittedRef.current = true;
    submit("(Time up) " + ((answer || "").trim() || "(No answer)"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  // Audio upload
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

      // Same flow as text submit
      if (res.data.finished) {
        setFinalReport(res.data);
        setMsg("🎉 Interview Finished!");
      } else {
        setSession((prev) => ({
          ...prev,
          question_index: res.data.next_question_index,
          question: res.data.next_question,
          difficulty: res.data.current_difficulty || prev.difficulty,
        }));

        setMsg(
          `Audio scored ✅ Score: ${res.data.score} | Similarity: ${Number(
            res.data.similarity
          ).toFixed(2)}`
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return forceLogout();
      setMsg(err?.response?.data?.detail || "Audio submit failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  // Resume if session_id present
  useEffect(() => {
    if (!resumeSessionId) return;

    (async () => {
      setLoadingResume(true);
      setMsg("");
      setFinalReport(null);
      setAnswer("");

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
          });
        } else {
          setSession({
            session_id: data.session_id,
            domain: data.domain,
            difficulty: data.difficulty,
            question_index: data.question_index,
            question: data.question,
          });
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) return forceLogout();
        setMsg(err?.response?.data?.detail || "Failed to resume interview");
        setSp({}); // remove broken query
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
        className="max-w-2xl w-full"
      >
        {loadingResume ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Resuming interview...
          </div>
        ) : !session ? (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Start Interview</h2>

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

              <button
                onClick={start}
                disabled={loadingStart}
                className="mt-4 bg-white text-black px-6 py-3 rounded-xl hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
              >
                {loadingStart ? "Starting..." : "Start"}
              </button>
            </div>

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

              <button
                onClick={start}
                className="border border-white/20 px-5 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Start New Interview
              </button>
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
            <div className="flex items-center justify-between gap-3">
              <div className="text-white/70 text-sm">
                Session: <span className="text-white">{session.session_id}</span>
              </div>

              <div
                className={`text-sm ${
                  secondsLeft <= 10 ? "text-red-300" : "text-white/70"
                }`}
              >
                Time left: <span className="text-white">{mm}:{ss}</span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold">
              Q{(session.question_index ?? 0) + 1}
            </h2>
            <p className="text-white/70">{session.question}</p>

            {/* ✅ Audio recorder */}
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
              disabled={loadingSubmit || uploadingAudio}
            />

            <div className="flex gap-3">
              <button
                onClick={() => submit()}
                disabled={loadingSubmit || uploadingAudio}
                className="bg-white text-black px-6 py-2 rounded-lg hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
              >
                {loadingSubmit ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={() => nav("/")}
                className="border border-white/20 px-6 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Back
              </button>
            </div>

            {msg && <p className="text-green-400 font-medium">{msg}</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}