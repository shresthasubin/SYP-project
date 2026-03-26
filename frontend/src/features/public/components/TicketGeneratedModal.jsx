import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import {
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { initiateEsewaPayment } from "../../../shared/api/payment.api.js";

const formatTime = (value) => String(value || "").slice(0, 5);

const formatDateTime = (showDate, startTime) => {
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

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSeatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getSeatCount = (bookingSummary, booking, tickets) => {
  const summaryCount = toNumber(bookingSummary?.seatCount);
  if (summaryCount > 0) return summaryCount;

  const explicitCount = toNumber(
    booking?.seat_count ??
      booking?.seatCount ??
      booking?.ticket_count ??
      booking?.ticketCount ??
      booking?.quantity,
  );
  if (explicitCount > 0) return explicitCount;

  const bookingSeats = normalizeSeatList(
    booking?.selectedSeats ??
      booking?.selected_seats ??
      booking?.seat_numbers ??
      booking?.seatNumbers ??
      booking?.seats,
  );
  if (bookingSeats.length > 0) return bookingSeats.length;

  return tickets.length;
};

const getBookingTotal = (bookingSummary, booking, tickets) => {
  const summaryTotal = toNumber(bookingSummary?.totalAmount);
  if (summaryTotal > 0) return summaryTotal;

  const explicitTotal = toNumber(
    booking?.total_amount ??
      booking?.totalAmount ??
      booking?.amount ??
      booking?.price ??
      booking?.grand_total ??
      booking?.grandTotal,
  );
  if (explicitTotal > 0) return explicitTotal;

  return tickets.reduce((sum, ticket) => sum + toNumber(ticket.price), 0);
};

const getTicketQrPayload = (ticket, movieTitle, hallName, when) =>
  JSON.stringify({
    ticket_id: ticket.id || "",
    ticket_code: ticket.ticket_code || "",
    booking_id: ticket.booking_id || "",
    movie: movieTitle,
    schedule: when,
    venue: hallName,
    seat: ticket.Seat?.seat_number || "",
  });

const slideTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" },
};

export default function TicketGeneratedModal({ open, payload, onClose }) {
  const booking = payload?.booking || {};
  const bookingSummary = payload?.bookingSummary || {};
  const showtime = payload?.showtime || {};
  const tickets = Array.isArray(payload?.tickets) ? payload.tickets : [];
  const hasTickets = tickets.length > 0;
  const movieTitle = showtime.Movie?.movie_title || "Movie";
  const hallName = showtime.Hallroom?.Hall?.hall_name || "Cinema Hall";
  const roomName = showtime.Hallroom?.roomName || "Room";
  const when = formatDateTime(showtime.show_date, showtime.start_time);
  const total = getBookingTotal(bookingSummary, booking, tickets);
  const seatCount = getSeatCount(bookingSummary, booking, tickets);

  const [activeStep, setActiveStep] = useState(hasTickets ? 1 : 0);

  useEffect(() => {
    if (open) {
      setActiveStep(hasTickets ? 1 : 0);
    }
  }, [open, hasTickets]);

  const handleEsewaPayment = async () => {
    const bookingId = booking.id;
    if (!bookingId) {
      toast.error("Missing booking id for payment");
      return;
    }

    try {
      const res = await initiateEsewaPayment({ bookingId });
      if (!res?.success) {
        toast.error(res?.message || "Failed to initiate payment");
        return;
      }

      const transactionUuid = res?.data?.payment?.transaction_id;
      if (transactionUuid) {
        localStorage.setItem("esewa_transaction_uuid", String(transactionUuid));
      }

      const paymentUrl = res?.data?.paymentUrl || res?.data?.url?.split("?")[0];
      const paymentPayload = res?.data?.payload;

      if (!paymentUrl || !paymentPayload || typeof paymentPayload !== "object") {
        toast.error("Payment payload not returned by server");
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.style.display = "none";

      Object.entries(paymentPayload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value ?? "");
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to initiate payment");
    }
  };

  const handleDownloadTicket = async (ticket) => {
    try {
      const qrUrl = await QRCode.toDataURL(getTicketQrPayload(ticket, movieTitle, hallName, when), {
        width: 240,
        margin: 1,
        errorCorrectionLevel: "M",
      });

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const startX = 40;
      const startY = 46;

      doc.setFillColor(17, 24, 39);
      doc.roundedRect(24, 24, pageWidth - 48, 360, 12, 12, "F");
      doc.setDrawColor(42, 51, 82);
      doc.roundedRect(24, 24, pageWidth - 48, 360, 12, 12, "S");

      doc.setTextColor(245, 247, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(movieTitle, startX, startY + 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(209, 216, 240);
      doc.text(`Date & Time: ${when}`, startX, startY + 52);
      doc.text(`Venue: ${hallName} - ${roomName}`, startX, startY + 76);
      doc.text(`Seat: ${ticket.Seat?.seat_number || "-"}`, startX, startY + 100);
      doc.text(`Ticket Code: ${ticket.ticket_code || "-"}`, startX, startY + 124);
      doc.text(`Price: ${formatCurrency(ticket.price)}`, startX, startY + 148);

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 182, startY, 138, 138, 8, 8, "F");
      doc.addImage(qrUrl, "PNG", pageWidth - 174, startY + 8, 122, 122);

      doc.setFontSize(10);
      doc.setTextColor(181, 191, 220);
      doc.text("Show this QR at cinema entry for validation.", startX, 330);
      doc.text(`Generated: ${new Date().toLocaleString()}`, startX, 346);

      doc.save(`ticket-${ticket.ticket_code || ticket.id || "cinemahub"}.pdf`);
    } catch (err) {
      toast.error(err.message || "Failed to download ticket");
    }
  };

  const steps = [
    { key: "payment", label: "Payment" },
    { key: "ticket", label: "Ticket" },
  ];

  if (!open || !payload) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent
        sx={{
          p: { xs: 2, md: 3.5 },
          background: "linear-gradient(180deg, rgba(16,18,30,0.99) 0%, rgba(10,12,22,0.99) 100%)",
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Chip
              icon={<CheckCircle2 size={14} />}
              label={hasTickets ? "Ticket Ready" : "Booking Created"}
              sx={{
                color: hasTickets ? "#86efac" : "#fca5a5",
                bgcolor: hasTickets ? "rgba(34,197,94,0.12)" : "rgba(229,9,20,0.12)",
                border: hasTickets ? "1px solid rgba(34,197,94,0.28)" : "1px solid rgba(229,9,20,0.22)",
                fontWeight: 700,
              }}
            />
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 900 }}>
              {movieTitle}
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.76)" }}>
              {when} | {hallName} | {roomName}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.75, display: "block", color: "rgba(255,255,255,0.54)" }}>
              Booking #{booking.id || "-"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <X size={18} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {steps.map((step, index) => {
            const active = index === activeStep;
            const complete = index < activeStep || (hasTickets && index <= 1);
            return (
              <Box key={step.key} sx={{ flex: 1 }}>
                <Paper
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: active ? "rgba(229,9,20,0.16)" : "rgba(255,255,255,0.03)",
                    border: complete
                      ? "1px solid rgba(229,9,20,0.24)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: active ? "#fff" : "rgba(255,255,255,0.72)",
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {step.label}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Stack>

        <AnimatePresence mode="wait">
          <motion.div key={activeStep} {...slideTransition}>
            {activeStep === 0 ? (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper
                  sx={{
                    flex: { md: "0 0 280px" },
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: "rgba(229,9,20,0.12)",
                    border: "1px solid rgba(229,9,20,0.18)",
                    color: "#fff",
                    }}
                  >
                    <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#fca5a5" }}>
                      Payment Ready
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                      <Clock3 size={16} color="#fca5a5" />
                      <Typography>{when}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <MapPin size={16} color="#93c5fd" />
                      <Typography>{hallName}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Ticket size={16} color="#e50914" />
                        <Typography>{seatCount} seat{seatCount === 1 ? "" : "s"} reserved</Typography>
                      </Stack>
                    </Stack>
                </Paper>

                <Paper
                  sx={{
                    flexGrow: 1,
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Complete payment
                  </Typography>
                  <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>
                    Your booking has been created. Continue with eSewa to finish payment and generate your tickets.
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "rgba(255,255,255,0.62)" }}>Movie</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{movieTitle}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "rgba(255,255,255,0.62)" }}>Venue</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{hallName}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "rgba(255,255,255,0.62)" }}>Total</Typography>
                      <Typography sx={{ fontWeight: 900 }}>{formatCurrency(total)}</Typography>
                    </Stack>
                  </Stack>

                  <Paper
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "rgba(59,130,246,0.08)",
                      border: "1px solid rgba(59,130,246,0.18)",
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <ShieldCheck size={18} color="#93c5fd" />
                      <Typography sx={{ color: "rgba(255,255,255,0.76)" }}>
                        Payment is redirected securely. Your selected seats stay attached to this booking while you complete checkout.
                      </Typography>
                    </Stack>
                  </Paper>
                </Paper>
              </Stack>
            ) : null}

            {activeStep === 1 ? (
              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Ticket generated
                </Typography>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>
                  Your tickets are ready. Download them now or view them later from your profile.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  {tickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      sx={{
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          spacing={2}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Ticket size={16} color="#f1ea76" />
                              <Typography sx={{ fontWeight: 800 }}>
                                Seat {ticket.Seat?.seat_number || "-"}
                              </Typography>
                            </Stack>
                            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.62)", fontFamily: "monospace" }}>
                              {ticket.ticket_code}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography sx={{ fontWeight: 800 }}>{formatCurrency(ticket.price)}</Typography>
                            <Button
                              variant="outlined"
                              startIcon={<Download size={16} />}
                              onClick={() => handleDownloadTicket(ticket)}
                              sx={{
                                borderRadius: 3,
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.18)",
                                textTransform: "none",
                                fontWeight: 700,
                              }}
                            >
                              Download
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2.5 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                    {tickets.length} ticket{tickets.length === 1 ? "" : "s"} generated
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }}>Total: {formatCurrency(total)}</Typography>
                </Stack>
              </Paper>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
          {!hasTickets ? (
            <Button
              variant="contained"
              onClick={handleEsewaPayment}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.3,
                bgcolor: "#e50914",
                color: "#fff",
                textTransform: "none",
                fontWeight: 900,
                "&:hover": { bgcolor: "#c80811" },
              }}
            >
              Pay with eSewa
            </Button>
          ) : null}

          <Button
            component={Link}
            to="/profile"
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.3,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.18)",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            View My Tickets
          </Button>

          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.3,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.18)",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
