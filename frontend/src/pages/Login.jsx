import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import MeshBackground from "../components/MeshBackground";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) nav("/", { replace: true });
  }, [nav]);

  const errToText = (e) => {
    const data = e?.response?.data;
    if (Array.isArray(data?.detail)) return data.detail.map((d) => d.msg).join(" | ");
    if (typeof data?.detail === "string") return data.detail;
    return "Login failed";
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    const em = email.trim(), pw = password.trim();
    if (!em || !pw) { setMsg("Please enter your email and password."); return; }
    try {
      setLoading(true);
      const form = new URLSearchParams();
      form.append("username", em);
      form.append("password", pw);
      const res = await api.post("/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
      localStorage.setItem("token", res.data.access_token);
      nav("/", { replace: true });
    } catch (e) { setMsg(errToText(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white relative">
      <MeshBackground />
      <div className="grain" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow */}
        <div
          className="absolute -inset-8 rounded-[48px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(109,95,255,0.18) 0%, transparent 70%)", filter: "blur(20px)" }}
        />

        <div
          className="relative rounded-[32px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Top border glow */}
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(109,95,255,0.6), rgba(0,229,204,0.4), transparent)" }} />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6d5fff, #00e5cc)", boxShadow: "0 0 20px rgba(109,95,255,0.5)" }}
              >
                <span className="text-[11px] font-black text-white">SI</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Smart Interview</p>
                <p className="text-[10px] text-white/35 font-mono uppercase tracking-widest">Analyzer</p>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Welcome back
            </h1>
            <p className="text-sm text-white/45 mb-8">Sign in to continue your preparation journey.</p>

            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 rounded-2xl border border-red-500/25 bg-red-500/10 text-sm text-red-300 flex items-center gap-2"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0">
                  <circle cx="8" cy="8" r="6"/><path d="M8 5v3"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
                </svg>
                {msg}
              </motion.div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-white/60 mb-2">Email address</label>
                <div className="relative">
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28">
                    <rect x="1" y="3" width="14" height="10" rx="2"/><path d="m1 5 7 5 7-5"/>
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-white/60 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28">
                    <rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/>
                  </svg>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                      {showPass ? <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/><path d="M1 1l14 14"/></> : <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></>}
                    </svg>
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full py-3.5 rounded-full font-bold text-white text-sm btn-shimmer transition-all"
                style={{
                  background: loading ? "rgba(109,95,255,0.4)" : "linear-gradient(135deg, #6d5fff 0%, #00e5cc 100%)",
                  boxShadow: loading ? "none" : "0 0 30px rgba(109,95,255,0.35)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </motion.button>
            </form>

            <p className="mt-7 text-center text-sm text-white/45">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-[#a78bfa] hover:text-[#6d5fff] transition-colors">
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
