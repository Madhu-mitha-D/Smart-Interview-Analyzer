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
  return (
    <div
      className={["flex flex-col items-center gap-2 p-6 md:p-8", className].join(
        " "
      )}
    >
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return (
    <div className={["p-6 pt-0 md:p-8 md:pt-0", className].join(" ")}>
      {children}
    </div>
  );
}

function Separator() {
  return <div className="mx-6 h-px bg-white/8 md:mx-8" />;
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-white/72">
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
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-none stroke-current"
        strokeWidth="2"
      >
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
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variant === "link"
          ? "h-auto bg-transparent p-0 text-white/60 hover:text-white"
          : "h-11 w-full bg-white text-black hover:bg-white/90",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StrengthBar({ password }) {
  const strength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const labels = ["", "Weak", "Good", "Strong"];
  const widths = ["0%", "33%", "66%", "100%"];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5 pt-1"
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-white/70 transition-all duration-300"
          style={{ width: widths[strength] }}
        />
      </div>
      <p className="text-[11px] text-white/45">{labels[strength]} password</p>
    </motion.div>
  );
}

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) nav("/", { replace: true });
  }, [nav]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    const fn = fullName.trim();
    const em = email.trim();
    const pw = password.trim();

    if (!fn || !em || !pw) {
      setMsg({ text: "Please fill all fields.", type: "error" });
      return;
    }

    if (pw.length < 6) {
      setMsg({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    if (!acceptTerms) {
      setMsg({
        text: "Please accept the terms to continue.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        email: em,
        password: pw,
        full_name: fn,
      });

      setMsg({ text: "Account created! Redirecting…", type: "success" });
      setTimeout(() => nav("/login", { replace: true }), 1400);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setMsg({
          text: "Email already registered — try logging in.",
          type: "error",
        });
      } else {
        setMsg({
          text: err?.response?.data?.detail || "Registration failed.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 text-white">
      <MeshBackground />
      <div className="grain" />

      <div className="relative z-10 flex min-h-screen items-center justify-center py-10">
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
                  Create your account
                </h1>
                <p className="text-sm text-white/42">
                  Join and start practicing with AI-powered interview feedback.
                </p>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <AnimatePresence>
                {msg.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/72"
                  >
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

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
                      placeholder="Create a password"
                      type={showPass ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-e-md text-white/45 transition hover:text-white/75"
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      aria-pressed={showPass}
                      aria-controls="password"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <StrengthBar password={password} />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptTerms}
                    onChange={setAcceptTerms}
                  />
                  <Label htmlFor="accept-terms">
                    I agree to the terms and want to create an account
                  </Label>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Continue"}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-white/42">
                Already have an account?{" "}
                <Link to="/login" className="text-white/78 hover:text-white">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}