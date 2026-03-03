import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Interview from "./pages/Interview.jsx";
import Insights from "./pages/Insights.jsx";
import Analytics from "./pages/Analytics.jsx"; // create next

import Layout from "./components/Layout.jsx";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function ProtectedLayout({ children }) {
  return (
    <Protected>
      <Layout>{children}</Layout>
    </Protected>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedLayout>
              <Interview />
            </ProtectedLayout>
          }
        />

        {/* ✅ Real Insights page */}
        <Route
          path="/insights"
          element={
            <ProtectedLayout>
              <Insights />
            </ProtectedLayout>
          }
        />

        {/* ✅ Real Analytics page (we’ll build after insights) */}
        <Route
          path="/analytics"
          element={
            <ProtectedLayout>
              <Analytics />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}