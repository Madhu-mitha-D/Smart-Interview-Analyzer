import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
      });

      setMsg("✅ Registered successfully! You can now login.");
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: 10 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />
        <button style={{ padding: 10, cursor: "pointer" }}>
          Register
        </button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}