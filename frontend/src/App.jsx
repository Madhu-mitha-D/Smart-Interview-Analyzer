import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (NO Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected / main app routes (WITH Layout) */}
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} /> {/* optional but safe */}
          <Route path="/interview" element={<Interview />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}