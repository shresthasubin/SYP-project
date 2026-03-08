import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Ticket, X } from "lucide-react";
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

export default function TicketGeneratedModal({ open, payload, onClose }) {
  if (!open || !payload) return null;

  const booking = payload.booking || {};
  const showtime = payload.showtime || {};
  const tickets = Array.isArray(payload.tickets) ? payload.tickets : [];
  const hasTickets = tickets.length > 0;
  const movieTitle = showtime.Movie?.movie_title || "Movie";
  const hallName = showtime.Hallroom?.Hall?.hall_name || "Cinema Hall";
  const roomName = showtime.Hallroom?.roomName || "Room";
  const when = formatDateTime(showtime.show_date, showtime.start_time);
  const total = tickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);

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
      const payload = res?.data?.payload;

      if (!paymentUrl || !payload || typeof payload !== "object") {
        toast.error("Payment payload not returned by server");
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.style.display = "none";

      Object.entries(payload).forEach(([key, value]) => {
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

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 p-4">
      <div className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#060d22] p-5 text-white shadow-2xl md:mt-14 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle2 size={14} />
              {hasTickets ? "Ticket Generated" : "Booking Created"}
            </p>
            <h3 className="mt-3 text-2xl font-bold">{movieTitle}</h3>
            <p className="mt-1 text-sm text-slate-300">
              {when} | {hallName} - {roomName}
            </p>
            <p className="mt-1 text-xs text-slate-400">Booking #{booking.id || "-"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/20 p-1.5 text-slate-300 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {hasTickets ? (
          <>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-white/10 bg-[#0a1230]/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-[#f1ea76]">
                        <Ticket size={14} />
                        {ticket.Seat?.seat_number || "Seat"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-300">{ticket.ticket_code}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{formatCurrency(ticket.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-sm text-slate-300">
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"} generated
              </p>
              <p className="text-sm font-semibold text-white">Total: {formatCurrency(total)}</p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#0a1230]/60 p-4 text-sm text-slate-300">
            Complete payment to generate your tickets.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleEsewaPayment}
            className="rounded-lg bg-[#e7df58] px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
          >
            Pay with eSewa
          </button>
          <Link
            to="/profile"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            onClick={onClose}
          >
            View My Tickets
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
