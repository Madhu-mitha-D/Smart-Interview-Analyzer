import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import MeshBackground from "../components/MeshBackground";

function Input({ icon, right, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className="w-full h-11 rounded-2xl text-sm text-white placeholder:text-white/22 bg-white/[0.05] border border-white/[0.1] transition-all duration-200
          focus:outline-none focus:border-teal-400/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,229,204,0.1)]
          hover:border-white/20 hover:bg-white/[0.07]"
        style={{
          paddingLeft: icon ? "2.6rem" : "1rem",
          paddingRight: right ? "2.6rem" : "1rem",
          fontFamily: "var(--font-body)",
        }}
      />
      {right && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
          {right}
        </span>
      )}
    </div>
  );
}

function StrengthBar({ password }) {
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const labels = ["", "Weak", "Good", "Strong"];
  const colors = ["", "#ff4d88", "#f59e0b", "#00e5cc"];

  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5 pt-1"
    >
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{
              background: i <= strength ? colors[strength] : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono" style={{ color: colors[strength] }}>
        {labels[strength]} password
      </p>
    </motion.div>
  );
}

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [msg, setMsg]             = useState({ text: "", type: "" });
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) nav("/", { replace: true });
  }, [nav]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    const fn = fullName.trim(), em = email.trim(), pw = password.trim();
    if (!fn || !em || !pw) { setMsg({ text: "Please fill all fields.", type: "error" }); return; }
    if (pw.length < 6) { setMsg({ text: "Password must be at least 6 characters.", type: "error" }); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", { email: em, password: pw, full_name: fn });
      setMsg({ text: "Account created! Redirecting…", type: "success" });
      setTimeout(() => nav("/login", { replace: true }), 1400);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) setMsg({ text: "Email already registered — try logging in.", type: "error" });
      else setMsg({ text: err?.response?.data?.detail || "Registration failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white relative overflow-hidden py-10">
      <MeshBackground />
      <div className="grain" />

      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-48 -right-32 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,229,204,0.1) 0%,transparent 65%)", filter: "blur(70px)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-32 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(109,95,255,0.1) 0%,transparent 65%)", filter: "blur(70px)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Card glow */}
        <div
          className="absolute -inset-6 rounded-[48px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(0,229,204,0.12) 0%,transparent 70%)", filter: "blur(28px)" }}
        />

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.018) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(44px)",
          }}
        >
          {/* Top gradient line — teal variant */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(0,229,204,0.55),rgba(109,95,255,0.45),transparent)" }}
          />

          <div className="px-8 py-9 sm:px-10">
            {/* Logo row */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 mb-8"
            >
              <div
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#00e5cc,#6d5fff)", boxShadow: "0 0 20px rgba(0,229,204,0.45)" }}
              >
                <span className="text-[11px] font-black text-white z-10 relative">SI</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Smart Interview
                </p>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">Create your account</p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-7"
            >
              <h1
                className="text-[28px] font-extrabold text-white tracking-tight mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Get started free
              </h1>
              <p className="text-sm text-white/38">
                Build your interview skills with AI-powered feedback.
              </p>
            </motion.div>

            {/* Message */}
            <AnimatePresence>
              {msg.text && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl border ${
                    msg.type === "success"
                      ? "border-teal-500/25 bg-teal-500/[0.09]"
                      : "border-red-500/20 bg-red-500/[0.08]"
                  }`}
                >
                  {msg.type === "success" ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="#00e5cc" strokeWidth="1.7" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="6" /><path d="m5 8 2 2 4-4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="6" /><path d="M8 5v3" /><circle cx="8" cy="11" r="0.5" fill="currentColor" />
                    </svg>
                  )}
                  <p className={`text-[12.5px] leading-relaxed ${msg.type === "success" ? "text-teal-300" : "text-red-300"}`}>
                    {msg.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/35"
                  style={{ fontFamily: "var(--font-mono)" }}>Full name</label>
                <Input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  icon={
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <circle cx="8" cy="6" r="3" /><path d="M2 14c0-3 2.686-5 6-5s6 2 6 5" />
                    </svg>
                  }
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/35"
                  style={{ fontFamily: "var(--font-mono)" }}>Email address</label>
                <Input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <rect x="1" y="3" width="14" height="10" rx="2" /><path d="m1 5 7 5 7-5" />
                    </svg>
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/35"
                  style={{ fontFamily: "var(--font-mono)" }}>Password</label>
                <Input
                  type={showPass ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  icon={
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V5a3 3 0 0 1 6 0v2" />
                    </svg>
                  }
                  right={
                    <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)} className="hover:text-white/60 transition-colors">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        {showPass ? (
                          <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /><path d="M1 1l14 14" /></>
                        ) : (
                          <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></>
                        )}
                      </svg>
                    </button>
                  }
                />
                <StrengthBar password={password} />
              </div>

              {/* Benefits row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 py-1">
                {["Free forever", "AI feedback", "No card needed"].map((f) => (
                  <span key={f} className="flex items-center gap-1 text-[11px] text-white/35 font-mono">
                    <svg viewBox="0 0 12 12" fill="none" stroke="#00e5cc" strokeWidth="1.8" className="w-3 h-3">
                      <path d="m2 6 3 3 5-5" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="relative w-full h-11 rounded-full font-bold text-white text-sm overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  background: loading
                    ? "rgba(0,229,204,0.35)"
                    : "linear-gradient(135deg,#00e5cc 0%,#6d5fff 100%)",
                  boxShadow: loading ? "none" : "0 0 28px rgba(0,229,204,0.3)",
                }}
              >
                {!loading && (
                  <span
                    className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20"
                    style={{ animation: "shimmer-slide 2.6s infinite" }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Sign in link */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.07]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] text-white/25 font-mono bg-transparent">
                  ALREADY HAVE AN ACCOUNT?
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 w-full h-10 rounded-full text-sm font-semibold text-white/55 border border-white/[0.09] hover:border-white/20 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
            >
              Sign In Instead
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}