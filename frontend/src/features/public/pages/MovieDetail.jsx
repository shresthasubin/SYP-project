import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import LiveChatModal from "../../chat/components/LiveChatModal.jsx";
import MovieDetailPanel from "../components/MovieDetailPanel.jsx";
import BookingPanel from "../components/BookingPanel.jsx";
import TicketGeneratedModal from "../components/TicketGeneratedModal.jsx";

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

const getCastImageUrl = (castImage) => {
  if (!castImage) return "https://placehold.co/120x120?text=Cast";
  if (String(castImage).startsWith("http")) return castImage;
  return `${API_SERVER_URL}/uploads/${castImage}`;
};

const getTrailerUrl = (movieTrailer) => {
  if (!movieTrailer) return "";
  if (String(movieTrailer).startsWith("http")) return movieTrailer;
  return `${API_SERVER_URL}/uploads/${movieTrailer}`;
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
const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;
const SEAT_HOLD_SECONDS = 5 * 60;

const sortSeats = (a, b) => {
  const rowA = Number(a.row) || 0;
  const rowB = Number(b.row) || 0;
  if (rowA !== rowB) return rowA - rowB;
  return (Number(a.column) || 0) - Number(b.column || 0);
};

const rowToLabel = (rowNumber) => {
  const n = Number(rowNumber);
  if (!Number.isFinite(n) || n <= 0) return "?";
  return String.fromCharCode(64 + n);
};

const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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
  const [heldSeatIds, setHeldSeatIds] = useState([]);
  const [generatedTicketPayload, setGeneratedTicketPayload] = useState(null);
  const [seatHoldDeadline, setSeatHoldDeadline] = useState(null);
  const [seatHoldSecondsLeft, setSeatHoldSecondsLeft] = useState(0);
  const bookingSocketRef = useRef(null);
  const activeShowtimeRef = useRef(null);

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
        setActiveDate(fetchedShowtimes.length > 0 ? toDateKey(fetchedShowtimes[0].show_date) : "");
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
      const existing = map.get(key) || { hallId: s.Hallroom?.Hall?.id, hallName, hallLocation, roomName, times: [] };
      existing.times.push({ id: s.id, start: formatTime(s.start_time), end: formatTime(s.end_time) });
      map.set(key, existing);
    });

    return Array.from(map.values());
  }, [showtimes, activeDate, uniqueDates]);

  const toggleSeatSelection = (seat) => {
    const seatId = normalizeId(seat?.id);
    if (!seat || seat.type !== "seat" || !seatId || seat.isBooked || heldSeatIds.includes(seatId)) return;

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) return prev.filter((sid) => sid !== seatId);
      return [...prev, seatId];
    });
  };

  const openBookingModal = async (showtimeId) => {
    const normalizedShowtimeId = normalizeId(showtimeId);
    const showtime = showtimes.find((item) => normalizeId(item.id) === normalizedShowtimeId);
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
      const availabilityRes = await axios.get(`${API_BASE_URL}/ticket/availability/${normalizedShowtimeId}`);
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

  const changeBookingDate = (dateKey) => {
    if (!selectedShowtime) return;

    const nextShowtime =
      showtimes.find(
        (item) =>
          Number(item.hallroom_id) === Number(selectedShowtime.hallroom_id) &&
          toDateKey(item.show_date) === dateKey,
      ) || showtimes.find((item) => toDateKey(item.show_date) === dateKey);

    if (nextShowtime?.id) {
      openBookingModal(nextShowtime.id);
    }
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
    setSelectedShowtime(null);
    setAvailableSeats([]);
    setSelectedSeatIds([]);
    setHeldSeatIds([]);
    setSeatHoldDeadline(null);
    setSeatHoldSecondsLeft(0);
    setBookingSubmitting(false);
  };

  const handleBookTickets = async () => {
    if (!selectedShowtime?.id) return;
    const normalizedSeatIds = [...new Set(selectedSeatIds.map(normalizeId).filter(Boolean))];
    if (normalizedSeatIds.length === 0) return toast.error("Please select at least one seat");

    try {
      setBookingSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/ticket/book/${selectedShowtime.id}`,
        { seatIds: normalizedSeatIds },
        { withCredentials: true },
      );
      if (response.data?.success) {
        toast.success("Booking created. Complete payment to generate tickets.");
        setGeneratedTicketPayload({
          ...(response.data?.data || {}),
          bookingSummary: {
            seatCount: normalizedSeatIds.length,
            seatLabels: selectedSeatObjects.map((seat) => seat.seat_number).filter(Boolean),
            totalAmount: ticketTotal,
          },
        });
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
    () => availableSeats.filter((seat) => seat.type === "seat" && selectedSeatIds.includes(normalizeId(seat.id))),
    [availableSeats, selectedSeatIds],
  );

  const selectedSeatLabels = useMemo(() => selectedSeatObjects.map((seat) => seat.seat_number).join(", "), [selectedSeatObjects]);

  const ticketTotal = useMemo(
    () => selectedSeatObjects.reduce((sum, seat) => sum + (seat.seatType === "premium" ? 500 : 300), 0),
    [selectedSeatObjects],
  );

  const handleOpenChat = (group) => {
    if (!group.hallId) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setChatHall({ id: group.hallId, name: group.hallName });
    setChatOpen(true);
  };

  useEffect(() => {
    if (!bookingOpen || !selectedShowtime?.id || selectedSeatIds.length === 0) {
      setSeatHoldDeadline(null);
      setSeatHoldSecondsLeft(0);
      return;
    }

    const deadline = Date.now() + SEAT_HOLD_SECONDS * 1000;
    setSeatHoldDeadline(deadline);
    setSeatHoldSecondsLeft(SEAT_HOLD_SECONDS);
  }, [bookingOpen, selectedShowtime?.id, selectedSeatIds]);

  useEffect(() => {
    if (!seatHoldDeadline || selectedSeatIds.length === 0) return;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(0, Math.ceil((seatHoldDeadline - Date.now()) / 1000));
      setSeatHoldSecondsLeft(secondsLeft);

      if (secondsLeft === 0) {
        setSelectedSeatIds([]);
        setSeatHoldDeadline(null);
        toast.error("Seat hold expired after 5 minutes. Please select seats again.");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [seatHoldDeadline, selectedSeatIds.length]);

  useEffect(() => {
    if (!bookingOpen || !selectedShowtime?.id || !user?.id) return;

    const socket = bookingSocketRef.current || io(API_SERVER_URL, {
      query: { userId: String(user.id) },
      transports: ["websocket"],
    });

    bookingSocketRef.current = socket;
    const joinedShowtimeId = Number(selectedShowtime.id);
    activeShowtimeRef.current = joinedShowtimeId;
    socket.emit("booking:join-showtime", { showtimeId: joinedShowtimeId });

    const handleHeldSeats = (payload) => {
      const payloadShowtimeId = Number(payload?.showtimeId);
      if (!payloadShowtimeId || payloadShowtimeId !== activeShowtimeRef.current) return;

      const holds = Array.isArray(payload?.holds) ? payload.holds : [];
      const blocked = holds
        .filter((hold) => Number(hold.userId) !== Number(user.id))
        .map((hold) => Number(hold.seatId))
        .filter((seatId) => Number.isInteger(seatId) && seatId > 0);
      setHeldSeatIds([...new Set(blocked)]);
    };

    const handleSeatUpdate = (payload) => {
      const payloadShowtimeId = Number(payload?.showtimeId);
      if (!payloadShowtimeId || payloadShowtimeId !== activeShowtimeRef.current) return;

      const seatIds = Array.isArray(payload?.seatIds)
        ? payload.seatIds.map((seatId) => Number(seatId)).filter((seatId) => Number.isInteger(seatId) && seatId > 0)
        : [];
      if (!seatIds.length) return;

      const seatIdSet = new Set(seatIds);
      const shouldBook = payload?.action !== "released";

      setAvailableSeats((prev) => prev.map((seat) => (seatIdSet.has(Number(seat.id)) ? { ...seat, isBooked: shouldBook } : seat)));

      if (shouldBook) {
        setSelectedSeatIds((prev) => prev.filter((seatId) => !seatIdSet.has(Number(seatId))));
        setHeldSeatIds((prev) => prev.filter((seatId) => !seatIdSet.has(Number(seatId))));
      }
    };

    socket.on("booking:held-seats", handleHeldSeats);
    socket.on("booking:seats-updated", handleSeatUpdate);

    return () => {
      socket.emit("booking:selection-sync", { showtimeId: joinedShowtimeId, selectedSeatIds: [] });
      socket.off("booking:held-seats", handleHeldSeats);
      socket.off("booking:seats-updated", handleSeatUpdate);
      socket.emit("booking:leave-showtime", { showtimeId: joinedShowtimeId });
    };
  }, [bookingOpen, selectedShowtime?.id, user?.id]);

  useEffect(() => {
    if (!bookingOpen || !selectedShowtime?.id) return;
    if (!bookingSocketRef.current) return;
    bookingSocketRef.current.emit("booking:selection-sync", {
      showtimeId: Number(selectedShowtime.id),
      selectedSeatIds,
    });
  }, [bookingOpen, selectedSeatIds, selectedShowtime?.id]);

  useEffect(() => {
    return () => {
      if (bookingSocketRef.current) {
        bookingSocketRef.current.disconnect();
        bookingSocketRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-[#0a0a0a] px-4 py-16 pt-20 sm:px-6 sm:py-20 sm:pt-24">
        <div className="mx-auto max-w-6xl text-white/70">Loading movie details...</div>
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="min-h-[60vh] bg-[#0a0a0a] px-4 py-16 pt-20 sm:px-6 sm:py-20 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-400">{error || "Movie not found."}</p>
          <Link to="/movies" className="mt-4 inline-block rounded border border-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/5">
            Back to list
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#0a0a0a] pb-12 pt-4 sm:pb-14 sm:pt-6 md:pt-8 font-[Oswald] text-white">
      <MovieDetailPanel
        movie={movie}
        genreLabel={genreLabel}
        groupedByHallroom={groupedByHallroom}
        uniqueDates={uniqueDates}
        activeDate={activeDate}
        onDateChange={setActiveDate}
        onOpenBooking={openBookingModal}
        onOpenChat={handleOpenChat}
        formatDuration={formatDuration}
        getPosterUrl={getPosterUrl}
        getCastImageUrl={getCastImageUrl}
        getTrailerUrl={getTrailerUrl}
        prettyDateChip={prettyDateChip}
      />

      <BookingPanel
        bookingOpen={bookingOpen}
        movie={movie}
        selectedShowtime={selectedShowtime}
        genreLabel={genreLabel}
        uniqueDates={uniqueDates}
        showtimes={showtimes}
        seatRows={seatRows}
        selectedSeatIds={selectedSeatIds}
        heldSeatIds={heldSeatIds}
        selectedSeatLabels={selectedSeatLabels}
        bookingLoading={bookingLoading}
        selectedSeatCount={selectedSeatIds.length}
        seatHoldSecondsLeft={seatHoldSecondsLeft}
        ticketTotal={ticketTotal}
        bookingSubmitting={bookingSubmitting}
        onToggleSeatSelection={toggleSeatSelection}
        onOpenBooking={openBookingModal}
        onSelectBookingDate={changeBookingDate}
        onSubmitBooking={handleBookTickets}
        onClose={closeBookingModal}
        getPosterUrl={getPosterUrl}
        formatDuration={formatDuration}
        formatTime={formatTime}
        prettyDateChip={prettyDateChip}
        toDateKey={toDateKey}
        formatCurrency={formatCurrency}
      />

      <LiveChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        hallId={chatHall?.id}
        hallName={chatHall?.name}
        currentUserId={user?.id}
      />

      <TicketGeneratedModal
        open={Boolean(generatedTicketPayload)}
        payload={generatedTicketPayload}
        onClose={() => setGeneratedTicketPayload(null)}
      />
    </section>
  );
}
