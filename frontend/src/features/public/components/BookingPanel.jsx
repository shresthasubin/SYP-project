import React from "react";
import { Armchair, X } from "lucide-react";

export default function BookingPanel({
  bookingOpen,
  movie,
  selectedShowtime,
  genreLabel,
  uniqueDates,
  showtimes,
  seatRows,
  selectedSeatIds,
  heldSeatIds,
  selectedSeatLabels,
  bookingLoading,
  selectedSeatCount,
  seatHoldSecondsLeft,
  ticketTotal,
  bookingSubmitting,
  onToggleSeatSelection,
  onOpenBooking,
  onSubmitBooking,
  onClose,
  getPosterUrl,
  formatDuration,
  formatTime,
  prettyDateChip,
  toDateKey,
  formatCurrency,
}) {
  if (!bookingOpen) return null;
  const holdMinutes = String(Math.floor((seatHoldSecondsLeft || 0) / 60)).padStart(2, "0");
  const holdSeconds = String((seatHoldSecondsLeft || 0) % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0e14]/95 pb-10">
      <div className="mx-auto w-full max-w-[1480px] px-5 pt-8 md:px-8 xl:px-10">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{movie?.movie_title || "Movie"}</h3>
            <p className="mt-2 flex items-center gap-3 text-sm text-white/70">
              <span>{formatDuration(movie?.duration)}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{movie?.rating ? `Rating ${movie.rating}` : "PG"}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{genreLabel}</span>
            </p>
          </div>

          <div className="mt-1 w-full max-w-[560px]">
            <div className="flex items-center justify-between text-sm text-white/70">
              {["Seat", "Payment", "Ticket"].map((label, idx) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span>{label}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? "bg-[#E7F25B]" : "bg-white/20"}`} />
                </div>
              ))}
            </div>
            <div className="mt-2 h-px w-full bg-white/15" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-7 xl:gap-8">
          <aside className="col-span-12 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 lg:col-span-3 xl:p-6">
            <img
              src={getPosterUrl(movie?.moviePoster)}
              alt={movie?.movie_title || "Movie"}
              className="aspect-[3/4] w-full rounded-xl object-cover"
            />

            <div className="mt-6">
              <p className="text-sm font-semibold text-white">{selectedShowtime?.Hallroom?.Hall?.hall_name || "Cinema Hall"}</p>
              <p className="mt-1 text-xs text-white/60">{selectedShowtime?.Hallroom?.Hall?.hall_location || "Location unavailable"}</p>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2 text-[10px] text-white/60">
                {uniqueDates.slice(0, 6).map((dateKey) => {
                  const active = selectedShowtime && toDateKey(selectedShowtime.show_date) === dateKey;
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={`rounded px-2 py-1 ${active ? "bg-white/15 text-white" : "bg-white/5 text-white/60"}`}
                    >
                      {prettyDateChip(dateKey)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {showtimes
                .filter((item) => Number(item.hallroom_id) === Number(selectedShowtime?.hallroom_id) && toDateKey(item.show_date) === toDateKey(selectedShowtime?.show_date))
                .slice(0, 6)
                .map((time) => {
                  const active = Number(time.id) === Number(selectedShowtime?.id);
                  return (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => onOpenBooking(time.id)}
                      className={`h-10 rounded-lg text-xs ring-1 ring-white/10 ${active ? "bg-white/15 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                    >
                      {formatTime(time.start_time)}
                    </button>
                  );
                })}
            </div>
          </aside>

          <section className="col-span-12 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 lg:col-span-6 xl:p-7">
            <div className="mx-auto w-full max-w-[760px]">
              <div className="relative mx-auto h-32 w-full max-w-[720px] overflow-visible">
                <div className="pointer-events-none absolute left-1/2 top-[72px] h-16 w-[78%] -translate-x-1/2 rounded-full bg-[#ff2323]/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-[92px] h-10 w-[58%] -translate-x-1/2 rounded-full bg-[#ff3b3b]/12 blur-2xl" />
                <div className="absolute left-1/2 top-0 h-[108px] w-[92%] -translate-x-1/2 overflow-hidden">
                <div className="absolute inset-x-[1%] top-[22px] h-[150px] rounded-[50%] border-t-[17px] border-t-[#d51f1f] drop-shadow-[0_14px_19px_rgba(213,31,31,0.28)]" />
                  
                  <div className="absolute inset-x-0 top-[24px] text-center text-sm font-semibold text-white">
                    Screen
                  </div>
                </div>
              </div>

              {bookingLoading ? (
                <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-sm text-slate-300">Loading seats...</div>
              ) : (
                <>
                  <div className="mt-2 space-y-3.5">
                    {seatRows.map((row) => (
                      <div key={row.rowNumber} className="flex items-center justify-center gap-3.5">
                        <div className="w-6 text-right text-xs text-white/60">{row.rowLabel}</div>
                        <div className="flex items-center gap-1.5">
                          {row.seats.map((seat) => {
                            if (seat.type === "gap") return <span key={seat.id} className="h-[22px] w-[22px]" />;

                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = Boolean(seat.isBooked);
                            const isHeld = heldSeatIds.includes(Number(seat.id));
                            const seatClass = isBooked
                              ? "cursor-not-allowed"
                              : isHeld
                                ? "cursor-not-allowed opacity-60"
                              : isSelected
                                ? "drop-shadow-[0_0_6px_rgba(231,242,91,.45)]"
                                : "hover:scale-110";

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => onToggleSeatSelection(seat)}
                                disabled={isBooked || isHeld}
                                title={seat.seat_number}
                                className={`rotate-180 grid h-[22px] w-[22px] place-items-center transition duration-150 ${seatClass}`}
                              >
                                <Armchair
                                  size={18}
                                  className={
                                    
                                    isBooked
                                      ? "text-slate-400"
                                      : isHeld
                                        ? "text-red-400"
                                        : isSelected
                                          ? "text-[#E7F25B]"
                                          : "text-emerald-400"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>
                        <div className="w-6 text-left text-xs text-white/60">{row.rowLabel}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#E7F25B]/90 text-[11px] font-semibold text-black">
                        {selectedSeatIds.length}
                      </span>
                      <span>{selectedSeatIds.length} Selected Seats</span>
                    </div>
                    <div className="text-white/50">{selectedSeatLabels || "None"}</div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-7 text-xs text-white/60">
                    <div className="flex items-center gap-2"><Armchair size={18} className="text-emerald-400" />Available</div>
                    <div className="flex items-center gap-2"><Armchair size={18} className="text-slate-400" />Sold</div>
                    <div className="flex items-center gap-2"><Armchair size={18} className="text-red-400" />Locked</div>
                    <div className="flex items-center gap-2"><Armchair size={18} className="text-[#E7F25B]" />Selected by me</div>
                  </div>
            {selectedSeatCount > 0 && (
              <p className="mt-7 text-center text-1xl text-red-200">
                Seat will be deselected after 5 mins of inactivness.
              </p>
            )}
                </>
              )}
            </div>
          </section>

          <aside className="col-span-12 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 lg:col-span-3 xl:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold">Selected Seats</p>
              <button
                onClick={onClose}
                className="rounded-md border border-white/20 p-1.5 text-slate-300 hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>

            <div className="rounded-xl bg-white/5 px-4 py-3.5 ring-1 ring-white/10">
              <p className="text-xs text-white/60">Selected seat numbers</p>
              <p className="mt-2 text-sm text-white/85">{selectedSeatLabels || "None"}</p>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm text-white/60">
              <span>Seats selected:</span>
              <span className="text-white/85">{selectedSeatCount}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-white/60">
              <span>Hold timer:</span>
              <span className={`font-semibold ${selectedSeatCount > 0 ? "text-amber-300" : "text-white/50"}`}>
                {selectedSeatCount > 0 ? `${holdMinutes}:${holdSeconds}` : "--:--"}
              </span>
            </div>


            <div className="mt-3 flex items-center justify-between text-sm text-white/60">
              <span>Total Payment:</span>
              <span className="text-base font-semibold text-white">{formatCurrency(ticketTotal)}</span>
            </div>

            <button
              type="button"
              onClick={onSubmitBooking}
              disabled={bookingSubmitting || selectedSeatIds.length === 0}
              className="mt-7 h-12 w-full rounded-xl bg-[#e8001c] text-base font-semibold text-black shadow-[0_12px_30px_rgba(231,242,91,.18)] hover:brightness-95 disabled:opacity-60"
            >
              {bookingSubmitting ? "Generating Ticket..." : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 h-12 w-full rounded-xl bg-transparent text-base font-semibold text-white/70 ring-1 ring-white/15 hover:bg-white/5"
            >
              Cancel
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
