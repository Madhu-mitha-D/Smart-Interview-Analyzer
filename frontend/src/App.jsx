import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import IntroAnimation from "./components/ui/IntroAnimation";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import DomainInterview from "./pages/DomainInterview";
import ResumeInterviewPage from "./pages/ResumeInterviewPage";
import CodingInterviewPage from "./pages/CodingInterviewPage";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const shouldShowIntro =
    token &&
    location.pathname === "/" &&
    location.state?.playIntro === true;

  const [introComplete, setIntroComplete] = useState(true);

  useEffect(() => {
    if (shouldShowIntro) {
      setIntroComplete(false);
    } else {
      setIntroComplete(true);
    }
  }, [shouldShowIntro]);

  const contentVisible = !shouldShowIntro || introComplete;

  return (
    <>
      {shouldShowIntro && !introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.45s ease",
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" replace /> : <Register />}
          />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview/domain" element={<DomainInterview />} />
            <Route path="/interview/resume" element={<ResumeInterviewPage />} />
            <Route path="/interview/coding" element={<CodingInterviewPage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={token ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}