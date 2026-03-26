import React, { useEffect, useMemo, useState } from "react";
import { Building2, Film, Clock3, Ticket, CalendarDays, MapPin } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../shared/config/api.js";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="h-full rounded-2xl border border-white/10 bg-black p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg p-3 border border-white/10 bg-white/5 ${color}`}>
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

const formatShowSchedule = (showDate, startTime) => {
  if (!showDate) return "Schedule unavailable";
  const timeValue = String(startTime || "").slice(0, 5) || "00:00";
  const date = new Date(`${showDate}T${timeValue}:00`);
  if (Number.isNaN(date.getTime())) return `${showDate} ${timeValue}`.trim();
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeBooking = (booking) => {
  const showtime = booking?.Showtime || booking?.showtime || {};
  const hallroom = showtime?.Hallroom || showtime?.hallroom || {};
  const hall = hallroom?.Hall || hallroom?.hall || booking?.Hall || booking?.hall || {};
  const movie = showtime?.Movie || showtime?.movie || booking?.Movie || booking?.movie || {};
  const user = booking?.User || booking?.user || {};
  const ticketList = Array.isArray(booking?.Tickets)
    ? booking.Tickets
    : Array.isArray(booking?.tickets)
      ? booking.tickets
      : [];

  const seatLabels = ticketList
    .map((ticket) => ticket?.Seat?.seat_number || ticket?.seat?.seat_number || ticket?.seat_number)
    .filter(Boolean)
    .map(String);

  return {
    id: booking?.id || booking?.booking_id || "-",
    customer: user?.fullname || user?.fullName || user?.name || user?.email || "Unknown customer",
    movieTitle: movie?.movie_title || movie?.title || "Unknown movie",
    hallName: hall?.hall_name || hall?.name || "Unknown hall",
    roomName: hallroom?.roomName || hallroom?.name || "Room unavailable",
    showSchedule: formatShowSchedule(showtime?.show_date, showtime?.start_time),
    bookedAt: formatDateTime(booking?.createdAt || booking?.created_at),
    bookedAtValue: booking?.createdAt || booking?.created_at || "",
    status: booking?.booking_status || booking?.status || "pending",
    totalAmount: Number(booking?.total_amount || booking?.totalAmount || booking?.amount || 0),
    seats: seatLabels.length ? seatLabels.join(", ") : "Not assigned",
    ticketCount: ticketList.length,
  };
};

const HallAdminDashboard = () => {
  const [hallsCount, setHallsCount] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [showtimesCount, setShowtimesCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hallRes, movieRes, showtimeRes, bookingRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/hall/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/showtime/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/bookings/all-bookings`, { withCredentials: true }),
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
      if (bookingRes.data?.success) {
        setBookings(Array.isArray(bookingRes.data.data) ? bookingRes.data.data : []);
        setBookingsError("");
      } else {
        setBookings([]);
        setBookingsError("Bookings could not be loaded.");
      }
    } catch {
      setHallsCount(0);
      setMoviesCount(0);
      setShowtimesCount(0);
      setBookings([]);
      setBookingsError("Bookings could not be loaded.");
    } finally {
      setLoading(false);
      setBookingsLoading(false);
    }
  };

  const normalizedBookings = useMemo(
    () =>
      bookings
        .map(normalizeBooking)
        .sort((a, b) => new Date(b.bookedAtValue).getTime() - new Date(a.bookedAtValue).getTime()),
    [bookings],
  );

  const statCards = [
    { title: "Managed Halls", value: loading ? "..." : hallsCount, icon: Building2, color: "bg-emerald-500/20" },
    { title: "Managed Movies", value: loading ? "..." : moviesCount, icon: Film, color: "bg-blue-500/20" },
    { title: "Scheduled Shows", value: loading ? "..." : showtimesCount, icon: Clock3, color: "bg-amber-500/20" },
    { title: "Bookings", value: bookingsLoading ? "..." : normalizedBookings.length, icon: Ticket, color: "bg-rose-500/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Hall Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Manage your halls and movie listings from this workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-black p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
            <p className="text-sm text-slate-400">
              Live booking data from the backend is now visible here for hall admin review.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
            {bookingsLoading ? "Loading bookings..." : `${normalizedBookings.length} total bookings`}
          </div>
        </div>

        {bookingsError ? (
          <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {bookingsError}
          </div>
        ) : bookingsLoading ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-300">
            Loading booking records...
          </div>
        ) : normalizedBookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-300">
            No bookings found yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Movie & Hall</th>
                  <th className="px-4 py-3 font-semibold">Show</th>
                  <th className="px-4 py-3 font-semibold">Seats</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {normalizedBookings.map((booking) => (
                  <tr key={booking.id} className="align-top text-sm text-slate-200">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">#{booking.id}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.bookedAt}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{booking.customer}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{booking.movieTitle}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={13} />
                        {booking.hallName} / {booking.roomName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="flex items-center gap-1 text-sm text-slate-200">
                        <CalendarDays size={13} />
                        {booking.showSchedule}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{booking.ticketCount} ticket{booking.ticketCount === 1 ? "" : "s"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{booking.seats}</td>
                    <td className="px-4 py-4 font-medium text-white">Rs. {booking.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-slate-200">
                        {booking.status}
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

export default HallAdminDashboard;
