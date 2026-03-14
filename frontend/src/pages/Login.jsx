import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { PrimaryButton } from "../components/Buttons";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      nav("/", { replace: true });
    }
  }, [nav]);

  const errToText = (e) => {
    const data = e?.response?.data;

    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).join(" | ");
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    return "Login failed";
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const em = email.trim();
    const pw = password.trim();

    if (!em || !pw) {
      setMsg("⚠️ Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const form = new URLSearchParams();
      form.append("username", em);
      form.append("password", pw);

      const res = await api.post("/auth/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", res.data.access_token);
      nav("/", { replace: true });
    } catch (e) {
      setMsg(errToText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="mb-6 text-center text-3xl font-semibold">Login</h1>

          {msg && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
              />
            </div>

            <PrimaryButton disabled={loading} className="w-full py-2">
              {loading ? "Logging in..." : "Login"}
            </PrimaryButton>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Don’t have an account?{" "}
            <Link to="/register" className="text-white hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}