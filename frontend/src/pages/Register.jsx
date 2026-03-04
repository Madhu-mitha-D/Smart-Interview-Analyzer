import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { PrimaryButton, GhostButton, DangerButton } from "../components/Buttons";

export default function Register() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go home
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) nav("/", { replace: true });
  }, [nav]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    const fn = (fullName || "").trim();
    const em = (email || "").trim();
    const pw = (password || "").trim();

    if (!fn || !em || !pw) {
      setMsg("⚠️ Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: em,
        password: pw,
        full_name: fn,
      });

      setMsg("✅ Registered! Redirecting to login...");
      setTimeout(() => nav("/login", { replace: true }), 900);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) setMsg("❌ Email already exists. Try login.");
      else setMsg(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-semibold mb-6">Create account</h2>

          <form onSubmit={handleRegister} className="grid gap-4">
            <input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black py-3 rounded-xl font-medium hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-white/60">Already have an account?</span>
            <Link to="/login" className="text-white hover:underline">
              Login
            </Link>
          </div>

          {msg && <p className="mt-4 text-green-400 font-medium">{msg}</p>}
        </div>
      </motion.div>
    </div>
  );
}