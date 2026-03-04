import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { PrimaryButton } from "../components/Buttons";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert FastAPI errors to readable text
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

    try {
      setLoading(true);

      // FastAPI OAuth2 expects form-data
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

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
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

        <h1 className="text-3xl font-semibold mb-6 text-center">
          Login
        </h1>

        {msg && (
          <div className="mb-4 text-red-300 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">

          <div>
            <label className="text-sm text-white/70">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            />
          </div>

          <PrimaryButton
            disabled={loading}
            className="w-full py-2"
          >
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
    </div>
  );
}