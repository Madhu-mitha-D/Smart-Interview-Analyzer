import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function Interview() {
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");

  const start = async () => {
    setMsg("");
    const res = await api.post("/start-interview", {
      domain: "hr",
      difficulty: "easy",
    });
    setSession(res.data);
  };

  const submit = async () => {
    if (!session) return;

    const res = await api.post("/submit-answer", {
      session_id: session.session_id,
      answer,
    });

    setAnswer("");

    if (res.data.finished) {
      setMsg("🎉 Interview Finished! Check analytics.");
    } else {
      setSession((prev) => ({
        ...prev,
        question_index: res.data.next_question_index,
        question: res.data.next_question,
      }));
      setMsg(
        `Score: ${res.data.score} | Similarity: ${Number(
          res.data.similarity
        ).toFixed(2)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full"
      >
        {!session ? (
          <button
            onClick={start}
            className="bg-white text-black px-6 py-3 rounded-xl hover:scale-105 transition"
          >
            Start Interview
          </button>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Q{session.question_index + 1}
            </h2>

            <p className="text-gray-400">{session.question}</p>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <button
              onClick={submit}
              className="bg-white text-black px-6 py-2 rounded-lg hover:scale-105 transition"
            >
              Submit
            </button>

            {msg && (
              <p className="text-green-400 font-medium">{msg}</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}