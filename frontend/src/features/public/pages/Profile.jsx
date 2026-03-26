import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarClock,
  CircleUserRound,
  Clock3,
  CreditCard,
  Download,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Settings,
  Ticket,
  Wallet,
} from "lucide-react";
import axios from "axios";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api.js";

const MENU_ITEMS = [
  { key: "account", label: "My Account", icon: CircleUserRound },
  { key: "tickets", label: "My Tickets", icon: Ticket },
  { key: "wallet", label: "My Wallet", icon: Wallet },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "watchlist", label: "My Watchlist", icon: Heart },
  { key: "settings", label: "Settings", icon: Settings },
];

const pageSurface = {
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(14,14,16,0.98) 100%)",
  color: "#fff",
  boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
};

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

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "GU";
};

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

const InfoCard = ({ label, value }) => (
  <Paper sx={{ ...pageSurface, p: 2.5 }}>
    <Typography
      sx={{
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </Typography>
    <Typography sx={{ mt: 1.25, fontSize: 18, fontWeight: 800, color: "#fff" }}>
      {value}
    </Typography>
  </Paper>
);

const TicketRow = ({ ticket, ticketQrMap, onDownloadTicket }) => (
  <Paper
    sx={{
      ...pageSurface,
      p: { xs: 2, md: 2.5 },
      transition: "transform 180ms ease, border-color 180ms ease",
      "&:hover": {
        transform: "translateY(-4px)",
        borderColor: "rgba(229,9,20,0.32)",
      },
    }}
  >
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Box
          component="img"
          src={ticket.poster}
          alt={`${ticket.title} poster`}
          sx={{
            width: { xs: 62, md: 72 },
            height: { xs: 92, md: 104 },
            borderRadius: 2,
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: "#fff" }}>
            {ticket.title}
          </Typography>
          <Stack spacing={0.8} sx={{ mt: 1.25 }}>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
              <Clock3 size={14} color="#e50914" />
              {ticket.dateTime}
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
              <MapPin size={14} color="#e50914" />
              {ticket.venue}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
              {ticket.seats}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.42)", fontSize: 12 }}>
              Booking #{ticket.id}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "row", sm: "row" }}
        spacing={1.5}
        alignItems="center"
        sx={{ width: { xs: "100%", md: "auto" }, justifyContent: { xs: "space-between", md: "flex-end" } }}
      >
        <Box
          component="img"
          src={ticketQrMap[ticket.id] || "https://placehold.co/180x180?text=QR"}
          alt={`QR for ticket ${ticket.ticketCode || ticket.id}`}
          sx={{
            width: 72,
            height: 72,
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.12)",
            backgroundColor: "#fff",
            p: 0.5,
          }}
        />
        <Stack spacing={1} alignItems={{ xs: "flex-end", md: "flex-end" }}>
          <Chip
            label={ticket.status}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              color:
                ticket.status === "Upcoming"
                  ? "#fff"
                  : ticket.status === "Cancelled"
                    ? "#fecdd3"
                    : "rgba(255,255,255,0.78)",
              border:
                ticket.status === "Upcoming"
                  ? "1px solid rgba(229,9,20,0.34)"
                  : ticket.status === "Cancelled"
                    ? "1px solid rgba(244,63,94,0.34)"
                    : "1px solid rgba(255,255,255,0.14)",
              backgroundColor:
                ticket.status === "Upcoming"
                  ? "rgba(229,9,20,0.16)"
                  : ticket.status === "Cancelled"
                    ? "rgba(244,63,94,0.12)"
                    : "rgba(255,255,255,0.06)",
            }}
          />
          <Button
            type="button"
            onClick={() => onDownloadTicket(ticket)}
            variant="outlined"
            startIcon={<Download size={14} />}
            sx={{
              borderRadius: 999,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.18)",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#e50914",
                backgroundColor: "rgba(229,9,20,0.08)",
              },
            }}
          >
            Download Ticket
          </Button>
        </Stack>
      </Stack>
    </Stack>
  </Paper>
);

const TicketSection = ({ title, subtitle, tickets, loading, ticketQrMap, onDownloadTicket }) => (
  <Box>
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 0.8, color: "rgba(255,255,255,0.6)" }}>{subtitle}</Typography>
      </Box>
      <Chip
        label={`${tickets.length} ${tickets.length === 1 ? "item" : "items"}`}
        sx={{
          borderRadius: 999,
          color: "#fff",
          fontWeight: 700,
          border: "1px solid rgba(255,255,255,0.14)",
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      />
    </Stack>
    {loading ? (
      <Paper sx={{ ...pageSurface, p: 3 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>Loading tickets...</Typography>
      </Paper>
    ) : tickets.length === 0 ? (
      <Paper sx={{ ...pageSurface, p: 3 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>No tickets available.</Typography>
      </Paper>
    ) : (
      <Stack spacing={2}>
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} ticketQrMap={ticketQrMap} onDownloadTicket={onDownloadTicket} />
        ))}
      </Stack>
    )}
  </Box>
);

const Profile = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
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

  const profileInitials = useMemo(() => getInitials(displayName), [displayName]);

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

        return {
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
      })
      .sort((a, b) => {
        const da = new Date(`${a.showDate || "1970-01-01"}T${a.startTime || "00:00"}:00`).getTime();
        const db = new Date(`${b.showDate || "1970-01-01"}T${b.startTime || "00:00"}:00`).getTime();
        return db - da;
      });
  }, [rawTickets]);

  const upcomingTickets = useMemo(() => ticketCards.filter((ticket) => ticket.status === "Upcoming"), [ticketCards]);
  const pastTickets = useMemo(() => ticketCards.filter((ticket) => ticket.status !== "Upcoming"), [ticketCards]);

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
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "rgba(255,255,255,0.65)" }}>
        Loading profile...
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box component="main" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="sm">
          <Paper sx={{ ...pageSurface, p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff" }}>
              Profile
            </Typography>
            <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.65)" }}>
              You need to sign in to view your profile and tickets.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              startIcon={<LogIn size={16} />}
              sx={{
                mt: 3,
                borderRadius: 999,
                px: 3,
                py: 1.2,
                backgroundColor: "#e50914",
                textTransform: "none",
                fontWeight: 800,
                "&:hover": { backgroundColor: "#c80811" },
              }}
            >
              Sign In
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        pb: 8,
        pt: { xs: 2, sm: 4 },
        background:
          "radial-gradient(circle at top left, rgba(229,9,20,0.08) 0%, rgba(229,9,20,0) 32%), radial-gradient(circle at top right, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 28%), #050505",
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4, lg: 6 } }}>
        <Stack spacing={3}>
          <Paper sx={{ ...pageSurface, p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      border: "1px solid rgba(255,255,255,0.12)",
                      bgcolor: "#e50914",
                      color: "#fff",
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    {profileInitials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, color: "#fff" }}>
                      {displayName}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.58)", fontSize: 14 }} noWrap>
                      {user?.email || "No email"}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={`${MENU_ITEMS.find((item) => item.key === activeTab)?.label || "Profile"} view`}
                  sx={{
                    borderRadius: 999,
                    color: "#fff",
                    fontWeight: 700,
                    border: "1px solid rgba(255,255,255,0.14)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                />
              </Stack>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {MENU_ITEMS.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    startIcon={<Icon size={18} />}
                    sx={{
                      borderRadius: 999,
                      px: 2,
                      py: 1.15,
                      color: activeTab === key ? "#fff" : "rgba(255,255,255,0.74)",
                      backgroundColor: activeTab === key ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.03)",
                      border: activeTab === key ? "1px solid rgba(229,9,20,0.28)" : "1px solid rgba(255,255,255,0.08)",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": {
                        backgroundColor: activeTab === key ? "rgba(229,9,20,0.22)" : "rgba(255,255,255,0.06)",
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Stack spacing={3}>
              <Paper
                sx={{
                  ...pageSurface,
                  p: { xs: 3, md: 4 },
                  background:
                    "radial-gradient(circle at top right, rgba(229,9,20,0.16) 0%, rgba(229,9,20,0) 30%), linear-gradient(135deg, rgba(24,24,27,0.98) 0%, rgba(15,15,18,0.98) 62%, rgba(46,10,14,0.94) 100%)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.55)",
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      Profile Panel
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1, fontWeight: 900, color: "#fff", fontSize: { xs: "2rem", md: "2.8rem" } }}>
                      {MENU_ITEMS.find((item) => item.key === activeTab)?.label || "Profile"}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CalendarClock size={14} />}
                    label="Updated Just Now"
                    sx={{
                      borderRadius: 999,
                      color: "#fff",
                      fontWeight: 700,
                      border: "1px solid rgba(255,255,255,0.14)",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      "& .MuiChip-icon": { color: "#e50914" },
                    }}
                  />
                </Stack>
              </Paper>

              {activeTab === "account" && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <InfoCard label="Full Name" value={displayName} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoCard label="Email" value={user?.email || "-"} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoCard label="Role" value={user?.role || "user"} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoCard label="Selected Location" value={selectedCity} />
                  </Grid>
                </Grid>
              )}

              {activeTab === "tickets" && (
                <Stack spacing={4}>
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
                </Stack>
              )}

              {activeTab === "settings" && (
                <Stack spacing={2.5}>
                  <Paper sx={{ ...pageSurface, p: 3 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Appearance</Typography>
                    <Typography sx={{ mt: 1.2, color: "rgba(255,255,255,0.68)" }}>
                      Dark mode is enabled across the entire site.
                    </Typography>
                  </Paper>
                  <Paper sx={{ ...pageSurface, p: 3 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Session</Typography>
                    <Button
                      onClick={logout}
                      variant="outlined"
                      startIcon={<LogOut size={16} />}
                      sx={{
                        mt: 2,
                        borderRadius: 999,
                        color: "#fecdd3",
                        borderColor: "rgba(244,63,94,0.4)",
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": {
                          borderColor: "rgba(244,63,94,0.72)",
                          backgroundColor: "rgba(244,63,94,0.08)",
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </Paper>
                </Stack>
              )}

              {["wallet", "payments", "watchlist"].includes(activeTab) && (
                <Card sx={pageSurface}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                      This section is ready for integration with backend data.
                    </Typography>
                  </CardContent>
                </Card>
              )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Profile;
