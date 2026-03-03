import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, MessageCircle, Star, Ticket, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import LiveChatModal from "../../chat/components/LiveChatModal.jsx";

const formatDuration = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const getPosterUrl = (moviePoster) => {
  if (!moviePoster) return "https://placehold.co/800x1200?text=No+Poster";
  if (String(moviePoster).startsWith("http")) return moviePoster;
  return `${API_SERVER_URL}/uploads/${moviePoster}`;
};

const toDateKey = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const prettyDateChip = (dateKey) => {
  const d = new Date(dateKey);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const formatTime = (value) => String(value || "").slice(0, 5) || "--:--";
const sortSeats = (a, b) => {
  const rowA = Number(a.row) || 0;
  const rowB = Number(b.row) || 0;
  if (rowA !== rowB) return rowA - rowB;
  return (Number(a.column) || 0) - (Number(b.column) || 0);
};
const rowToLabel = (rowNumber) => {
  const n = Number(rowNumber);
  if (!Number.isFinite(n) || n <= 0) return "?";
  return String.fromCharCode(64 + n);
};

export default function MovieDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHall, setChatHall] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const [movieRes, showtimeRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/movie/get/${id}`),
          axios.get(`${API_BASE_URL}/showtime/movie/${id}`),
        ]);

        if (!mounted) return;

        if (!movieRes.data?.success) {
          setError("Movie not found.");
          return;
        }

        const fetchedMovie = movieRes.data.data;
        const fetchedShowtimes = showtimeRes.data?.success ? showtimeRes.data.data || [] : [];

        setMovie(fetchedMovie);
        setShowtimes(fetchedShowtimes);

        const firstDate = fetchedShowtimes.length > 0 ? toDateKey(fetchedShowtimes[0].show_date) : "";
        setActiveDate(firstDate);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Failed to load movie details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const genreLabel = useMemo(() => {
    if (!movie?.genre) return "Unknown";
    return Array.isArray(movie.genre) ? movie.genre.join(" | ") : String(movie.genre);
  }, [movie]);

  const uniqueDates = useMemo(() => {
    const keys = Array.from(new Set(showtimes.map((s) => toDateKey(s.show_date)).filter(Boolean)));
    return keys.sort((a, b) => new Date(a) - new Date(b));
  }, [showtimes]);

  const groupedByHallroom = useMemo(() => {
    const targetDate = activeDate || uniqueDates[0];
    const filtered = showtimes.filter((s) => toDateKey(s.show_date) === targetDate);
    const map = new Map();

    filtered.forEach((s) => {
      const hallName = s.Hallroom?.Hall?.hall_name || "Cinema Hall";
      const hallLocation = s.Hallroom?.Hall?.hall_location || "Location unavailable";
      const roomName = s.Hallroom?.roomName || "Main Room";
      const key = `${hallName}::${roomName}`;

      const existing = map.get(key) || {
        hallId: s.Hallroom?.Hall?.id,
        hallName,
        hallLocation,
        roomName,
        times: [],
      };

      existing.times.push({
        id: s.id,
        start: formatTime(s.start_time),
        end: formatTime(s.end_time),
      });
      map.set(key, existing);
    });

    return Array.from(map.values());
  }, [showtimes, activeDate, uniqueDates]);

  const toggleSeatSelection = (seat) => {
    if (!seat || seat.type !== "seat" || seat.isBooked) return;
    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id],
    );
  };

  const openBookingModal = async (showtimeId) => {
    const showtime = showtimes.find((item) => item.id === showtimeId);
    if (!showtime) return;

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    try {
      setBookingLoading(true);
      setSelectedShowtime(showtime);
      setSelectedSeatIds([]);
      setBookingOpen(true);

      const availabilityRes = await axios.get(`${API_BASE_URL}/ticket/availability/${showtimeId}`);
      const seats = availabilityRes.data?.success ? availabilityRes.data?.data?.seats || [] : [];
      setAvailableSeats(seats.sort(sortSeats));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load seat availability");
      setBookingOpen(false);
      setSelectedShowtime(null);
      setAvailableSeats([]);
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
    setSelectedShowtime(null);
    setAvailableSeats([]);
    setSelectedSeatIds([]);
    setBookingSubmitting(false);
  };

  const handleBookTickets = async () => {
    if (!selectedShowtime?.id) return;
    if (selectedSeatIds.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    try {
      setBookingSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/ticket/book/${selectedShowtime.id}`,
        { seatIds: selectedSeatIds },
        { withCredentials: true },
      );

      if (response.data?.success) {
        toast.success("Tickets booked successfully");
        closeBookingModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book tickets");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const seatRows = useMemo(() => {
    const rows = new Map();
    availableSeats.forEach((seat) => {
      const rowNumber = Number(seat.row) || 0;
      if (!rows.has(rowNumber)) rows.set(rowNumber, []);
      rows.get(rowNumber).push(seat);
    });
    return Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNumber, seats]) => ({
        rowNumber,
        rowLabel: rowToLabel(rowNumber),
        seats: seats.sort((a, b) => (Number(a.column) || 0) - (Number(b.column) || 0)),
      }));
  }, [availableSeats]);

  const selectedSeatObjects = useMemo(
    () =>
      availableSeats.filter(
        (seat) => seat.type === "seat" && selectedSeatIds.includes(seat.id),
      ),
    [availableSeats, selectedSeatIds],
  );

  const estimatedTotal = useMemo(
    () =>
      selectedSeatObjects.reduce(
        (sum, seat) => sum + (seat.seatType === "premium" ? 500 : 300),
        0,
      ),
    [selectedSeatObjects],
  );

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-[#050812] py-20 pt-24">
        <div className="container mx-auto px-6 text-slate-300">Loading movie details...</div>
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="min-h-[60vh] bg-[#050812] py-20 pt-24">
        <div className="container mx-auto px-6">
          <p className="text-red-400">{error || "Movie not found."}</p>
          <Link
            to="/movies"
            className="mt-4 inline-block rounded-md border border-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/5"
          >
            Back to list
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#050812] pb-14 pt-24 text-white">
      <div className="container mx-auto space-y-6 px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220]">
          <div className="absolute inset-0">
            <img src={getPosterUrl(movie.moviePoster)} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#050812]/92 to-[#050812]/60" />
          </div>

          <div className="relative grid gap-5 p-5 md:grid-cols-[180px_1fr] md:p-8">
            <div className="overflow-hidden rounded-xl border border-white/15 bg-black/30">
              <img
                src={getPosterUrl(movie.moviePoster)}
                alt={movie.movie_title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold md:text-5xl">{movie.movie_title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={15} />
                  {formatDuration(movie.duration)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={15} />
                  {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Star size={15} className="text-accent" fill="currentColor" />
                  {Number(movie.rating) || "N/A"}
                </span>
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs">{genreLabel}</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                {movie.description || "No description available for this movie."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b1020] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select Date & Showtime</h2>
            <Link to="/movies" className="text-sm text-slate-300 hover:text-white">
              Back to movies
            </Link>
          </div>

          {uniqueDates.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
              No showtimes are listed for this movie yet.
            </div>
          ) : (
            <>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {uniqueDates.map((dateKey) => (
                  <button
                    key={dateKey}
                    onClick={() => setActiveDate(dateKey)}
                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors ${
                      (activeDate || uniqueDates[0]) === dateKey
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-white/15 bg-black/30 text-slate-300 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {prettyDateChip(dateKey)}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {groupedByHallroom.map((group) => (
                  <article
                    key={`${group.hallName}-${group.roomName}`}
                    className="rounded-xl border border-white/10 bg-[#111827] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{group.hallName}</h3>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={14} />
                          {group.hallLocation}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{group.roomName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15">
                          Continue
                        </button>
                        <button
                          onClick={() => {
                            if (!group.hallId) return;
                            if (!isAuthenticated) {
                              window.location.href = "/login";
                              return;
                            }
                            setChatHall({ id: group.hallId, name: group.hallName });
                            setChatOpen(true);
                          }}
                          disabled={!group.hallId}
                          className="inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/20"
                        >
                          <MessageCircle size={14} />
                          Chat with Hall
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.times.map((time) => (
                        <button
                          key={time.id}
                          onClick={() => openBookingModal(time.id)}
                          className="rounded border border-white/20 bg-black/25 px-3 py-1.5 text-sm text-white hover:border-accent hover:text-accent"
                        >
                          {time.start}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
          Choose any showtime above to select seats and book tickets.
        </div>
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040712]/95 pb-8">
          <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
            <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f20]">
              <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h3 className="text-4xl font-bold text-white">{movie?.movie_title || "Movie"}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {formatDuration(movie?.duration)} | {movie?.genre || "Genre"} | Rating {Number(movie?.rating) || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-5 text-sm text-slate-300">
                  <span className="font-semibold text-accent">Seat</span>
                  <span>Payment</span>
                  <span>Ticket</span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[320px_1fr_300px]">
              <aside className="rounded-2xl border border-white/10 bg-[#0a0f20] p-4">
                <img
                  src={getPosterUrl(movie?.moviePoster)}
                  alt={movie?.movie_title || "Movie"}
                  className="h-[420px] w-full rounded-xl object-cover"
                />
                <p className="mt-4 text-lg font-semibold text-white">
                  {selectedShowtime?.Hallroom?.Hall?.hall_name || "Cinema Hall"}
                </p>
                <p className="text-sm text-cyan-300">
                  {selectedShowtime?.Hallroom?.Hall?.hall_location || "Location unavailable"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded border border-white/20 px-3 py-1 text-xs text-slate-200">
                    {selectedShowtime?.show_date
                      ? new Date(selectedShowtime.show_date).toLocaleDateString()
                      : "--"}
                  </span>
                  <span className="rounded border border-white/20 px-3 py-1 text-xs text-slate-200">
                    {formatTime(selectedShowtime?.start_time)}
                  </span>
                </div>
              </aside>

              <section className="rounded-2xl border border-white/10 bg-[#0a0f20] p-4">
                <div className="mx-auto mb-6 w-full max-w-2xl rounded-t-[40px] border border-white/20 bg-slate-500/20 py-5 text-center text-lg text-slate-300">
                  Stage
                </div>

                {bookingLoading ? (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-sm text-slate-300">
                    Loading seats...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 overflow-x-auto pb-2">
                      {seatRows.map((row) => (
                        <div key={row.rowNumber} className="flex min-w-max items-center gap-2">
                          <span className="w-6 text-center text-sm font-semibold text-slate-300">
                            {row.rowLabel}
                          </span>
                          <div className="flex items-center gap-1">
                            {row.seats.map((seat) => {
                              if (seat.type === "gap") {
                                return (
                                  <span key={seat.id} className="h-6 w-6 rounded-sm border border-transparent" />
                                );
                              }

                              const isSelected = selectedSeatIds.includes(seat.id);
                              const isBooked = Boolean(seat.isBooked);
                              const seatClass = isBooked
                                ? "border-slate-600 bg-slate-600/40"
                                : isSelected
                                  ? "border-accent bg-accent/90"
                                  : "border-white/40 bg-white/95";

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => toggleSeatSelection(seat)}
                                  disabled={isBooked}
                                  title={seat.seat_number}
                                  className={`h-6 w-6 rounded-sm border transition ${seatClass}`}
                                />
                              );
                            })}
                          </div>
                          <span className="w-6 text-center text-sm font-semibold text-slate-300">
                            {row.rowLabel}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm border border-white/40 bg-white/95" />
                        Available
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm border border-slate-600 bg-slate-600/40" />
                        Reserved
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm border border-accent bg-accent" />
                        Selected
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-cyan-300">
                      {selectedSeatObjects.length} selected seat
                      {selectedSeatObjects.length === 1 ? "" : "s"}:{" "}
                      {selectedSeatObjects.map((seat) => seat.seat_number).join(", ") || "None"}
                    </p>
                  </>
                )}
              </section>

              <aside className="rounded-2xl border border-white/10 bg-[#0a0f20] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Selected Seats</h4>
                  <button
                    onClick={closeBookingModal}
                    className="rounded-md border border-white/20 p-1.5 text-slate-300 hover:bg-white/10"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedSeatObjects.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200"
                    >
                      <span>{seat.seat_number}</span>
                      <span>Rs. {seat.seatType === "premium" ? 500 : 300}</span>
                    </div>
                  ))}
                  {selectedSeatObjects.length === 0 && (
                    <div className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400">
                      No seats selected
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between text-base text-white">
                  <span>Total Payment</span>
                  <span className="font-bold text-accent">Rs. {estimatedTotal}</span>
                </div>

                <button
                  type="button"
                  onClick={handleBookTickets}
                  disabled={bookingSubmitting || selectedSeatIds.length === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  <Ticket size={15} />
                  {bookingSubmitting ? "Booking..." : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="mt-2 w-full rounded-md border border-white/20 px-4 py-3 text-sm text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}

      <LiveChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        hallId={chatHall?.id}
        hallName={chatHall?.name}
        currentUserId={user?.id}
      />
    </section>
  );
}
