import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) nav("/", { replace: true });
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);

      nav("/", { replace: true });
    } catch (err) {
      setMsg("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "350px" }}>
        <h2 style={{ marginBottom: "20px" }}>Login</h2>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px" }}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px" }}
          />

          <button type="submit" disabled={loading} style={{ padding: "10px", cursor: "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* 👇 REGISTER LINK (VERY CLEAR) */}
        <div style={{ marginTop: "20px" }}>
          <p>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "cyan", fontWeight: "bold" }}>
              Register Here
            </Link>
          </p>
        </div>

        {msg && <p style={{ marginTop: "15px", color: "red" }}>{msg}</p>}
      </div>
    </div>
  );
}