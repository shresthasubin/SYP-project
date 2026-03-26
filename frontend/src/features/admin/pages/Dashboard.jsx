import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Building2, Clock3, Film, FileCheck2, MapPin, Users } from "lucide-react";
import { API_BASE_URL } from "../../../shared/config/api.js";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="h-full rounded-2xl border border-white/10 bg-black p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg border border-white/10 bg-white/5 p-3 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeApplication = (application) => ({
  id: application?.id || "-",
  hallName: application?.hall_name || application?.hallName || "Untitled hall",
  ownerName: application?.owner_name || application?.ownerName || application?.fullname || "Unknown owner",
  email: application?.email || "No email",
  location: application?.hall_location || application?.hallLocation || "Location unavailable",
  status: application?.status || "pending",
  createdAt: formatDateTime(application?.createdAt || application?.created_at),
  createdAtValue: application?.createdAt || application?.created_at || "",
});

const Dashboard = () => {
  const [moviesCount, setMoviesCount] = useState(0);
  const [hallsCount, setHallsCount] = useState(0);
  const [showtimesCount, setShowtimesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const userHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

        const [movieRes, hallRes, showtimeRes, userRes, applicationRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/hall/get`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/showtime/get`, { withCredentials: true }),
          fetch(`${API_BASE_URL}/user/get`, {
            credentials: "include",
            headers: userHeaders,
          }),
          axios.get(`${API_BASE_URL}/hall/applications`, { withCredentials: true }),
        ]);

        if (movieRes.data?.success) setMoviesCount(movieRes.data.data?.length || 0);
        if (hallRes.data?.success) setHallsCount(hallRes.data.data?.length || 0);
        if (showtimeRes.data?.success) setShowtimesCount(showtimeRes.data.data?.length || 0);

        if (userRes.ok) {
          const userPayload = await userRes.json();
          if (userPayload?.success) {
            setUsersCount(Array.isArray(userPayload.data) ? userPayload.data.length : 0);
          }
        }

        setApplications(Array.isArray(applicationRes.data) ? applicationRes.data : []);
        setApplicationsError("");
      } catch {
        setMoviesCount(0);
        setHallsCount(0);
        setShowtimesCount(0);
        setUsersCount(0);
        setApplications([]);
        setApplicationsError("Applications could not be loaded.");
      } finally {
        setLoading(false);
        setApplicationsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const normalizedApplications = useMemo(
    () =>
      applications
        .map(normalizeApplication)
        .sort((a, b) => new Date(b.createdAtValue).getTime() - new Date(a.createdAtValue).getTime())
        .slice(0, 8),
    [applications],
  );

  const pendingApplications = useMemo(
    () => applications.filter((application) => String(application?.status || "").toLowerCase() === "pending").length,
    [applications],
  );

  const statCards = [
    { title: "Total Movies", value: loading ? "..." : moviesCount, icon: Film, color: "bg-blue-500/20" },
    { title: "Active Halls", value: loading ? "..." : hallsCount, icon: Building2, color: "bg-emerald-500/20" },
    { title: "Scheduled Shows", value: loading ? "..." : showtimesCount, icon: Clock3, color: "bg-amber-500/20" },
    { title: "Registered Users", value: loading ? "..." : usersCount, icon: Users, color: "bg-violet-500/20" },
    { title: "Applications", value: applicationsLoading ? "..." : applications.length, icon: FileCheck2, color: "bg-cyan-500/20" },
    { title: "Pending Review", value: applicationsLoading ? "..." : pendingApplications, icon: MapPin, color: "bg-rose-500/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Monitor the full CinemaHub system and review operational activity from one workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.title}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-black p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Hall Applications</h2>
            <p className="text-sm text-slate-400">
              Review the latest hall onboarding requests and their current status.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
            {applicationsLoading ? "Loading applications..." : `${applications.length} total applications`}
          </div>
        </div>

        {applicationsError ? (
          <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {applicationsError}
          </div>
        ) : applicationsLoading ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-300">
            Loading application records...
          </div>
        ) : normalizedApplications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-300">
            No applications found yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Application</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Hall</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {normalizedApplications.map((application) => (
                  <tr key={application.id} className="align-top text-sm text-slate-200">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">#{application.id}</p>
                      <p className="mt-1 text-xs text-slate-400">{application.createdAt}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{application.ownerName}</p>
                      <p className="mt-1 text-xs text-slate-400">{application.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{application.hallName}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{application.location}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-slate-200">
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
