import React, { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";

const getPosterUrl = (poster) => {
  if (!poster) return "";
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${String(poster).replace(/^\/+/, "").replace(/^uploads\//, "")}`;
};

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyHall = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/hall/get`, {
          withCredentials: true,
        });
        if (response.data?.success && Array.isArray(response.data.data)) {
          setHalls(response.data.data);
        } else {
          setHalls([]);
        }
      } catch {
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHall();
  }, []);

  const primaryHall = useMemo(() => halls[0] || null, [halls]);
  const totalSeats = useMemo(
    () => halls.reduce((sum, hall) => sum + Number(hall.capacity || hall.totalCapacity || 0), 0),
    [halls],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black p-6 text-sm text-slate-300">
        Loading your hall...
      </div>
    );
  }

  if (!primaryHall) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black p-6 text-sm text-slate-300">
        No hall is assigned to this hall admin account.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Hall</h1>
        <p className="mt-2 text-slate-400">
          This workspace only shows the hall assigned to your hall admin account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Managed Halls</p>
          <p className="mt-2 text-3xl font-bold text-white">{halls.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Seats</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalSeats}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
          <p className="mt-2 text-3xl font-bold text-white">{primaryHall.isActive ? "Active" : "Inactive"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        {primaryHall.hallPoster ? (
          <img
            src={getPosterUrl(primaryHall.hallPoster)}
            alt={primaryHall.hall_name || "Hall"}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-white/[0.03] text-slate-500">
            <Building2 size={42} />
          </div>
        )}

        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              <ShieldCheck size={14} className="text-[#D72626]" />
              Hall Admin Access
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white">
              {primaryHall.hall_name || "Cinema Hall"}
            </h2>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-[#D72626]" />
                {primaryHall.hall_location || "Location unavailable"}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-[#D72626]" />
                {primaryHall.hall_contact || "Contact unavailable"}
              </p>
              <p className="flex items-center gap-2">
                <Users size={15} className="text-[#D72626]" />
                {Number(primaryHall.capacity || primaryHall.totalCapacity || 0)} seats
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hall Details</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-400">License</p>
                <p className="mt-1 font-semibold text-white">{primaryHall.license || "Not available"}</p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <p className="mt-1 font-semibold text-white">{primaryHall.isActive ? "Currently active" : "Currently inactive"}</p>
              </div>
              <div>
                <p className="text-slate-400">Hall Count Returned</p>
                <p className="mt-1 font-semibold text-white">{halls.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Halls;
