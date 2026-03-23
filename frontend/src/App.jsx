import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroAnimation from "./components/ui/IntroAnimation";
import Layout from "./components/Layout";

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

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <IntroAnimation onComplete={() => setIntroComplete(true)} />

      <div
        style={{
          opacity: introComplete ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* App routes */}
            <Route element={<Layout />}>
              {/* Landing page AFTER login */}
              <Route index element={<Home />} />
              <Route path="/" element={<Home />} />

              {/* Main sections */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Interview section */}
              <Route path="/interview" element={<Interview />} />
              <Route path="/interview/domain" element={<DomainInterview />} />
              <Route
                path="/interview/resume"
                element={<ResumeInterviewPage />}
              />
              <Route
                path="/interview/coding"
                element={<CodingInterviewPage />}
              />

              {/* Results & profile */}
              <Route path="/insights" element={<Insights />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}