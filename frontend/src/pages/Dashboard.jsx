import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-4">Dashboard</h2>

        {loading ? (
          <p className="text-gray-500 mb-6">Loading user...</p>
        ) : me ? (
          <p className="text-gray-400 mb-6">
            Logged in as{" "}
            <span className="text-white font-medium">{me.email}</span>
          </p>
        ) : (
          <p className="text-red-400 mb-6">
            Not logged in (token missing/invalid). Please login again.
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Link
            to="/interview"
            className="bg-white text-black py-2 rounded-lg text-center font-medium hover:scale-105 transition"
          >
            Start Interview
          </Link>

          <button
            onClick={handleLogout}
            className="border border-white/20 py-2 rounded-lg hover:bg-white/10 transition"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}