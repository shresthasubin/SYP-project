import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleUserRound,
  Ticket,
  Wallet,
  CreditCard,
  Heart,
  Settings,
  MapPin,
  Clock3,
  CalendarClock,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Download,
} from "lucide-react";
import axios from "axios";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import avatar from "../../../assets/avatar.png";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import { useTheme } from "../../../shared/context/ThemeContext.jsx";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";

const MENU_ITEMS = [
  { key: "account", label: "My Account", icon: CircleUserRound },
  { key: "tickets", label: "My Tickets", icon: Ticket },
  { key: "wallet", label: "My Wallet", icon: Wallet },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "watchlist", label: "My Watchlist", icon: Heart },
  { key: "settings", label: "Settings", icon: Settings },
];

const getPosterUrl = (poster) => {
  if (!poster) return "https://placehold.co/600x900?text=No+Poster";
  if (String(poster).startsWith("http")) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const formatTime = (value) => String(value || "").slice(0, 5);

const formatTicketDateTime = (showDate, startTime) => {
  if (!showDate) return "Date unavailable";
  const t = formatTime(startTime) || "00:00";
  const d = new Date(`${showDate}T${t}:00`);
  if (Number.isNaN(d.getTime())) return `${showDate} ${t}`;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTicketQrPayload = (ticket) =>
  JSON.stringify({
    ticket_id: ticket.id || "",
    ticket_code: ticket.ticketCode || "",
    booking_id: ticket.bookingId || "",
    movie: ticket.title || "",
    showtime: ticket.dateTime || "",
    venue: ticket.venue || "",
    seat: ticket.seatLabel || "",
  });

const toDataUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const TicketRow = ({ ticket, ticketQrMap, onDownloadTicket }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1022]/90 p-4 transition-all duration-300 hover:border-[#e7df58]/50 hover:bg-[#101934] md:p-5">
    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <img
          src={ticket.poster}
          alt={`${ticket.title} poster`}
          className="h-20 w-14 rounded-lg object-cover shadow-lg shadow-black/30"
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-white">{ticket.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
            <Clock3 size={14} className="text-[#e7df58]" />
            {ticket.dateTime}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={14} className="text-[#e7df58]" />
            {ticket.venue}
          </p>
          <p className="mt-1 text-sm text-slate-400">{ticket.seats}</p>
          <p className="mt-1 text-xs text-slate-500">Booking #{ticket.id}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="flex items-center gap-3">
          <img
            src={ticketQrMap[ticket.id] || "https://placehold.co/180x180?text=QR"}
            alt={`QR for ticket ${ticket.ticketCode || ticket.id}`}
            className="h-16 w-16 rounded-lg border border-white/15 bg-white p-1"
          />
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
                ticket.status === "Upcoming"
                  ? "border-[#e7df58]/60 bg-[#e7df58]/15 text-[#f3ec7d]"
                  : ticket.status === "Cancelled"
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-300"
                    : "border-slate-500/50 bg-slate-500/15 text-slate-300"
              }`}
            >
              {ticket.status}
            </span>
            <button
              type="button"
              onClick={() => onDownloadTicket(ticket)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white hover:border-[#e7df58] hover:text-[#f3ec7d]"
            >
              <Download size={13} />
              Download Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
);

const TicketSection = ({ title, subtitle, tickets, loading, ticketQrMap, onDownloadTicket }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        {tickets.length} {tickets.length === 1 ? "item" : "items"}
      </span>
    </div>
    {loading ? (
      <div className="rounded-xl border border-white/10 bg-[#0a1022]/70 p-4 text-sm text-slate-300">Loading tickets...</div>
    ) : tickets.length === 0 ? (
      <div className="rounded-xl border border-white/10 bg-[#0a1022]/70 p-4 text-sm text-slate-300">No tickets available.</div>
    ) : (
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} ticketQrMap={ticketQrMap} onDownloadTicket={onDownloadTicket} />
        ))}
      </div>
    )}
  </section>
);

const Profile = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("tickets");
  const [rawTickets, setRawTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketQrMap, setTicketQrMap] = useState({});

  const displayName = useMemo(() => {
    const fromUser = user?.fullname || user?.fullName || user?.name;
    if (fromUser) return fromUser;
    if (user?.email) return user.email.split("@")[0];
    return "Guest User";
  }, [user]);

  const selectedCity = useMemo(() => {
    try {
      return localStorage.getItem("selected_city") || "Kathmandu";
    } catch {
      return "Kathmandu";
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || activeTab !== "tickets") return;

    const fetchMyTickets = async () => {
      try {
        setTicketsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/ticket/my`, { withCredentials: true });
        if (response.data?.success) {
          setRawTickets(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setRawTickets([]);
        }
      } catch {
        setRawTickets([]);
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchMyTickets();
  }, [activeTab, isAuthenticated]);

  const ticketCards = useMemo(() => {
    return rawTickets
      .map((ticket) => {
        const showDate = ticket.Showtime?.show_date || "";
        const startTime = formatTime(ticket.Showtime?.start_time);
        const d = showDate ? new Date(`${showDate}T${startTime || "00:00"}:00`) : null;
        const isUpcoming = d && !Number.isNaN(d.getTime()) ? d.getTime() >= Date.now() : false;

        let status = isUpcoming ? "Upcoming" : "Completed";
        const bookingStatus = ticket.Booking?.booking_status || "confirmed";
        if (bookingStatus === "cancelled") status = "Cancelled";

        const bookingId = ticket.booking_id || ticket.Booking?.id || "-";
        const seatLabel = ticket.Seat?.seat_number ? String(ticket.Seat.seat_number) : "No seat";
        const codeLabel = ticket.ticket_code ? String(ticket.ticket_code) : "-";

        const mappedTicket = {
          id: ticket.id,
          title: ticket.Showtime?.Movie?.movie_title || "Movie",
          dateTime: formatTicketDateTime(showDate, ticket.Showtime?.start_time),
          venue: `${ticket.Showtime?.Hallroom?.Hall?.hall_name || "Cinema Hall"}  -  ${ticket.Showtime?.Hallroom?.roomName || "Room"}`,
          seats: `Seat: ${seatLabel}  -  Code: ${codeLabel}`,
          poster: getPosterUrl(ticket.Showtime?.Movie?.moviePoster),
          bookingStatus,
          status,
          showDate,
          startTime,
          bookingId,
          seatLabel,
          ticketCode: codeLabel,
        };

        return mappedTicket;
      })
      .sort((a, b) => {
        const da = new Date(`${a.showDate || "1970-01-01"}T${a.startTime || "00:00"}:00`).getTime();
        const db = new Date(`${b.showDate || "1970-01-01"}T${b.startTime || "00:00"}:00`).getTime();
        return db - da;
      });
  }, [rawTickets]);

  const upcomingTickets = useMemo(
    () => ticketCards.filter((ticket) => ticket.status === "Upcoming"),
    [ticketCards],
  );
  const pastTickets = useMemo(
    () => ticketCards.filter((ticket) => ticket.status !== "Upcoming"),
    [ticketCards],
  );

  useEffect(() => {
    let cancelled = false;

    const buildQrs = async () => {
      try {
        const entries = await Promise.all(
          ticketCards.map(async (ticket) => {
            const qrUrl = await QRCode.toDataURL(getTicketQrPayload(ticket), {
              width: 180,
              margin: 1,
              errorCorrectionLevel: "M",
            });
            return [ticket.id, qrUrl];
          }),
        );
        if (!cancelled) setTicketQrMap(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setTicketQrMap({});
      }
    };

    if (ticketCards.length) {
      buildQrs();
    } else {
      setTicketQrMap({});
    }

    return () => {
      cancelled = true;
    };
  }, [ticketCards]);

  const handleDownloadTicket = async (ticket) => {
    const qrUrl =
      ticketQrMap[ticket.id] ||
      (await QRCode.toDataURL(getTicketQrPayload(ticket), {
        width: 240,
        margin: 1,
        errorCorrectionLevel: "M",
      }));

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 40;
    const startY = 46;

    doc.setFillColor(17, 26, 51);
    doc.roundedRect(24, 24, pageWidth - 48, 360, 12, 12, "F");
    doc.setDrawColor(42, 51, 82);
    doc.roundedRect(24, 24, pageWidth - 48, 360, 12, 12, "S");

    let posterData = null;
    try {
      posterData = await toDataUrl(ticket.poster);
    } catch (_) {
      posterData = null;
    }

    if (posterData) {
      doc.addImage(posterData, "JPEG", startX, startY, 88, 128);
    }

    const textX = posterData ? startX + 108 : startX;
    doc.setTextColor(245, 247, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.text(ticket.title || "Movie Ticket", textX, startY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(209, 216, 240);
    doc.text(`Date & Time: ${ticket.dateTime || "-"}`, textX, startY + 50);
    doc.text(`Venue: ${ticket.venue || "-"}`, textX, startY + 74, { maxWidth: 280 });
    doc.text(`Seat: ${ticket.seatLabel || "-"}`, textX, startY + 98);
    doc.text(`Ticket Code: ${ticket.ticketCode || "-"}`, textX, startY + 122);
    doc.text(`Booking ID: ${ticket.bookingId || "-"}`, textX, startY + 146);
    doc.text(`Status: ${ticket.status || "-"}`, textX, startY + 170);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 182, startY, 138, 138, 8, 8, "F");
    doc.addImage(qrUrl, "PNG", pageWidth - 174, startY + 8, 122, 122);

    doc.setTextColor(181, 191, 220);
    doc.setFontSize(10);
    doc.text("Show this QR at cinema entry for validation.", startX, 330);
    doc.text(`Generated: ${new Date().toLocaleString()}`, startX, 346);

    const fileName = `ticket-${String(ticket.ticketCode || ticket.id || "cinema-ticket")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60)}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return <div className="min-h-[60vh] px-6 py-24 text-center text-text-secondary">Loading profile...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] px-6 py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-secondary p-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="mt-2 text-sm text-text-secondary">You need to sign in to view your profile and tickets.</p>
          <Link
            to="/login"
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <LogIn size={16} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020614] pb-16 pt-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(231,223,88,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(48,84,204,0.16),transparent_36%)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-[280px_1fr] md:px-6">
        <aside className="rounded-2xl border border-white/10 bg-[#050b1f]/90 p-5 shadow-xl shadow-black/40">
          <div className="flex items-center gap-4">
            <img src={avatar} alt="User avatar" className="h-16 w-16 rounded-xl border border-white/15 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">{displayName}</p>
              <p className="truncate text-sm text-slate-400">{user?.email || "No email"}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {MENU_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base transition-colors ${
                  activeTab === key
                    ? "bg-[#e7df58]/15 font-semibold text-[#f3ec7d]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border border-white/10 bg-[#050b1f]/85 p-5 shadow-xl shadow-black/40 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e7df58]">Profile Panel</p>
              <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                {MENU_ITEMS.find((item) => item.key === activeTab)?.label || "Profile"}
              </h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-300 md:flex">
              <CalendarClock size={15} className="text-[#e7df58]" />
              Updated Just Now
            </div>
          </div>

          {activeTab === "account" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Full Name</p>
                <p className="mt-2 text-lg font-semibold text-white">{displayName}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                <p className="mt-2 text-lg font-semibold text-white">{user?.email || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">{user?.role || "user"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Selected Location</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedCity}</p>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="space-y-10">
              <TicketSection
                title="Upcoming Tickets & Orders"
                subtitle="Your next movie nights are lined up."
                tickets={upcomingTickets}
                loading={ticketsLoading}
                ticketQrMap={ticketQrMap}
                onDownloadTicket={handleDownloadTicket}
              />
              <TicketSection
                title="Past Tickets & Orders"
                subtitle="Recent bookings you have completed."
                tickets={pastTickets}
                loading={ticketsLoading}
                ticketQrMap={ticketQrMap}
                onDownloadTicket={handleDownloadTicket}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-sm font-semibold text-white">Appearance</p>
                <button
                  onClick={toggleTheme}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:border-[#e7df58] hover:text-[#e7df58]"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  Switch to {isDark ? "Light" : "Dark"} Theme
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-4">
                <p className="text-sm font-semibold text-white">Session</p>
                <button
                  onClick={logout}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-400/50 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}

          {["wallet", "payments", "watchlist"].includes(activeTab) && (
            <div className="rounded-xl border border-white/10 bg-[#0a1022]/80 p-5 text-slate-300">
              This section is ready for integration with backend data.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
