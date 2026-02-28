import React, { useEffect, useState } from "react";
import { Armchair } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || "http://localhost:3000";

const FormApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hall/applications`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setApplications(response.data.data || []);
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/hall/applications/${id}/approve`,
        {},
        { withCredentials: true },
      );
      toast.success("Application approved");
      fetchApplications();
    } catch (error) {
      const detailMessage = error.response?.data?.details?.[0]?.message;
      toast.error(
        detailMessage ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to approve application",
      );
    }
  };

  const handleRejectApplication = async (id) => {
    const reviewNote = window.prompt("Optional rejection note:", "") || "";
    try {
      await axios.put(
        `${API_BASE_URL}/hall/applications/${id}/reject`,
        { reviewNote },
        { withCredentials: true },
      );
      toast.success("Application rejected");
      fetchApplications();
    } catch (error) {
      const detailMessage = error.response?.data?.details?.[0]?.message;
      toast.error(
        detailMessage ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to reject application",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Form Applications</h1>
        <p className="mt-2 text-slate-400">Review hall registration submissions in detail.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black p-4">
        <h2 className="text-xl font-semibold text-white">Pending Hall Registrations</h2>
        {loading ? (
          <p className="mt-3 text-slate-400">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="mt-3 text-slate-400">No pending applications.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-lg border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{app.hall_name}</p>
                    <p className="text-sm text-slate-300">{app.hall_location}</p>
                    <p className="text-sm text-slate-400">
                      Contact: {app.hall_contact} | License: {app.license} | Submitted:{" "}
                      {new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedAppId((prev) => (prev === app.id ? null : app.id))}
                      className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      {expandedAppId === app.id ? "Hide Details" : "View Full Form"}
                    </button>
                    <button
                      onClick={() => handleApproveApplication(app.id)}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectApplication(app.id)}
                      className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {expandedAppId === app.id && (
                  <div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-black/40 p-4">
                    {app.hallPoster && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-200">Hall Poster</p>
                        <img
                          src={`${API_SERVER_URL}/uploads/${app.hallPoster}`}
                          alt={app.hall_name}
                          className="h-40 w-full rounded-lg object-cover md:w-80"
                        />
                      </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">Total Capacity:</span>{" "}
                        {app.totalCapacity ?? 0}
                      </p>
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">Applicant User ID:</span>{" "}
                        {app.applicant_id}
                      </p>
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">Status:</span> {app.status}
                      </p>
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">Review Note:</span>{" "}
                        {app.review_note || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-200">Hall Rooms & Seat Layout</p>
                      {!Array.isArray(app.hallrooms) || app.hallrooms.length === 0 ? (
                        <p className="text-sm text-slate-400">No room configuration submitted.</p>
                      ) : (
                        <div className="space-y-4">
                          {app.hallrooms.map((room, roomIndex) => {
                            const rows = Number(room.rows ?? room.totalRows ?? 0);
                            const seats = Number(room.seatsPerRow ?? room.totalColumns ?? 0);
                            const emptySeats = Array.isArray(room.emptySeats) ? room.emptySeats : [];
                            const emptySet = new Set(emptySeats);
                            const available = rows * seats - emptySeats.length;

                            return (
                              <div key={`${app.id}-${roomIndex}`} className="rounded-lg border border-white/10 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                  <p className="font-semibold text-white">
                                    {room.roomName || `Room ${roomIndex + 1}`}
                                  </p>
                                  <p className="text-xs text-slate-300">
                                    {available}/{rows * seats} available
                                  </p>
                                </div>
                                <div className="overflow-x-auto">
                                  <div className="inline-flex flex-col gap-2">
                                    {Array.from({ length: rows }).map((_, rowIndex) => (
                                      <div key={rowIndex} className="flex items-center gap-2">
                                        <span className="w-6 text-xs text-slate-300">
                                          {String.fromCharCode(65 + rowIndex)}
                                        </span>
                                        <div className="flex gap-1">
                                          {Array.from({ length: seats }).map((__, colIndex) => {
                                            const key = `${rowIndex}-${colIndex}`;
                                            const isEmpty = emptySet.has(key);
                                            return (
                                              <Armchair
                                                key={key}
                                                size={14}
                                                className={isEmpty ? "text-slate-600 opacity-40" : "text-pink-400"}
                                              />
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormApplications;
