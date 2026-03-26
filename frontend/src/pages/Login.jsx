import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/axios";
import MeshBackground from "../components/MeshBackground";
import { Eye, EyeOff, User } from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "w-full max-w-[440px] rounded-[28px] border border-white/10 bg-[#141416]/70 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return <div className={["flex flex-col items-center gap-2 p-6 md:p-8", className].join(" ")}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={["p-6 pt-0 md:p-8 md:pt-0", className].join(" ")}>{children}</div>;
}

function Separator() {
  return <div className="mx-6 h-px bg-white/8 md:mx-8" />;
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium text-white/72"
    >
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/28 outline-none transition",
        "focus:border-white/18 focus:bg-white/[0.06]",
        className,
      ].join(" ")}
    />
  );
}

function Checkbox({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={[
        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition",
        checked
          ? "border-white/40 bg-white text-black"
          : "border-white/20 bg-transparent text-transparent",
      ].join(" ")}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current" strokeWidth="2">
        <path d="m3.5 8 2.5 2.5 6-6" />
      </svg>
    </button>
  );
}

function Button({ children, className = "", variant = "default", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        variant === "link"
          ? "h-auto p-0 text-white/60 hover:text-white bg-transparent"
          : "h-11 w-full bg-white text-black hover:bg-white/90",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      nav("/", { replace: true });
    }
  }, [nav]);

  const errToText = (e) => {
    const d = e?.response?.data;
    if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg).join(" · ");
    if (typeof d?.detail === "string") return d.detail;
    return "Login failed. Please try again.";
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const em = email.trim();
    const pw = password.trim();

    if (!em || !pw) {
      setMsg("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const form = new URLSearchParams();
      form.append("username", em);
      form.append("password", pw);

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      nav("/", { replace: true, state: { playIntro: true } });
    } catch (err) {
      setMsg(errToText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 text-white">
      <MeshBackground />
      <div className="grain" />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          <Card>
            <CardHeader>
              <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/12 before:to-transparent before:opacity-100 md:size-24">
                <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-black/40 shadow-sm ring-1 ring-inset ring-white/10 md:size-16">
                  <User className="size-6 text-white/70 md:size-8" />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 text-center">
                <h1 className="text-xl font-medium text-white md:text-[22px]">
                  Sign in to your account
                </h1>
                <p className="text-sm text-white/42">
                  Enter your credentials to access your account.
                </p>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/72"
                  >
                    {msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      className="pe-9"
                      placeholder="Password"
                      type={isVisible ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-e-md text-white/45 transition hover:text-white/75"
                      type="button"
                      onClick={() => setIsVisible((v) => !v)}
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      aria-pressed={isVisible}
                      aria-controls="password"
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="keep-me-logged-in"
                      checked={keepLoggedIn}
                      onChange={setKeepLoggedIn}
                    />
                    <Label htmlFor="keep-me-logged-in">
                      Keep me logged in
                    </Label>
                  </div>

                  <button
                    type="button"
                    className="text-sm text-white/55 transition hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Continue"}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-white/42">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-white/78 hover:text-white">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}