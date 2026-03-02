import React, { useEffect, useState } from "react";
import { Building2, Film, Clock3 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../shared/config/api.js";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-xl bg-black border border-white/10 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const HallAdminDashboard = () => {
  const [hallsCount, setHallsCount] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [showtimesCount, setShowtimesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hallRes, movieRes, showtimeRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/hall/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/showtime/get`, { withCredentials: true }),
      ]);

      if (hallRes.data?.success) {
        setHallsCount(hallRes.data.data?.length || 0);
      }
      if (movieRes.data?.success) {
        setMoviesCount(movieRes.data.data?.length || 0);
      }
      if (showtimeRes.data?.success) {
        setShowtimesCount(showtimeRes.data.data?.length || 0);
      }
    } catch {
      setHallsCount(0);
      setMoviesCount(0);
      setShowtimesCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Hall Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Manage your halls and movie listings from this workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Managed Halls"
          value={loading ? "..." : hallsCount}
          icon={Building2}
          color="bg-emerald-500/20"
        />
        <StatCard
          title="Managed Movies"
          value={loading ? "..." : moviesCount}
          icon={Film}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Scheduled Shows"
          value={loading ? "..." : showtimesCount}
          icon={Clock3}
          color="bg-amber-500/20"
        />
      </div>
    </div>
  );
};

export default HallAdminDashboard;
