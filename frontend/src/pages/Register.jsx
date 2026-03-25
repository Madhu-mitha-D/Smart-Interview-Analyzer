import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import MeshBackground from "../components/MeshBackground";

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(0); // animation step

  useEffect(() => {
    if (localStorage.getItem("token")) nav("/", { replace: true });
    const t = setTimeout(() => setStep(1), 100);
    return () => clearTimeout(t);
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
      setMsg({ text: "Account created! Redirecting to login…", type: "success" });
      setTimeout(() => nav("/login", { replace: true }), 1400);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) setMsg({ text: "Email already exists. Try logging in.", type: "error" });
      else setMsg({ text: err?.response?.data?.detail || "Registration failed", type: "error" });
    } finally { setLoading(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ff4d88", "#f59e0b", "#00e5cc"];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white relative py-10">
      <MeshBackground />
      <div className="grain" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-10 rounded-[56px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,229,204,0.14) 0%, transparent 70%)", filter: "blur(24px)" }}
        />

        <div
          className="relative rounded-[32px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Top glow line */}
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,204,0.6), rgba(109,95,255,0.4), transparent)" }} />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00e5cc, #6d5fff)", boxShadow: "0 0 20px rgba(0,229,204,0.4)" }}
              >
                <span className="text-[11px] font-black text-white">SI</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Smart Interview</p>
                <p className="text-[10px] text-white/35 font-mono uppercase tracking-widest">Analyzer</p>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Create account</h1>
            <p className="text-sm text-white/45 mb-8">Start your interview preparation journey today.</p>

            {/* Message */}
            {msg.text && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 px-4 py-3 rounded-2xl border text-sm flex items-center gap-2 ${
                  msg.type === "success"
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/25 bg-red-500/10 text-red-300"
                }`}
              >
                {msg.type === "success" ? (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0">
                    <circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0">
                    <circle cx="8" cy="8" r="6"/><path d="M8 5v3"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/>
                  </svg>
                )}
                {msg.text}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-semibold text-white/60 mb-2">Full name</label>
                <div className="relative">
                  <input
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input-field pl-10"
                  />
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28">
                    <circle cx="8" cy="5.5" r="3"/><path d="M1.5 14a6.5 6.5 0 0 1 13 0"/>
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[13px] font-semibold text-white/60 mb-2">Email address</label>
                <div className="relative">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28">
                    <rect x="1" y="3" width="14" height="10" rx="2"/><path d="m1 5 7 5 7-5"/>
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-semibold text-white/60 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28">
                    <rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/>
                  </svg>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/>
                    </svg>
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                    <div className="flex gap-1.5 mb-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/10">
                          <motion.div
                            animate={{ width: strength >= i ? "100%" : "0%" }}
                            transition={{ duration: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: strengthColor[strength] }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] font-mono" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </p>
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full py-3.5 rounded-full font-bold text-white text-sm btn-shimmer transition-all mt-2"
                style={{
                  background: loading ? "rgba(0,229,204,0.3)" : "linear-gradient(135deg, #00e5cc 0%, #6d5fff 100%)",
                  boxShadow: loading ? "none" : "0 0 30px rgba(0,229,204,0.3)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>
                    Creating account…
                  </span>
                ) : "Create Free Account"}
              </motion.button>
            </form>

            <p className="mt-7 text-center text-sm text-white/45">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#00e5cc] hover:text-[#6d5fff] transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
