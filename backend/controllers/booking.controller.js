// controllers/booking.controller.js
import Booking from "../model/booking.model.js";
import Seat from "../model/seat.model.js";
import { seatLocks } from "../sockets/chat.socket.js"; // reuse the seatLocks map

export const bookSeat = async (req, res) => {
  try {
    const { seatId, showtimeId, userId, total_price, hallId } = req.body;

    // 1️⃣ check if seat is already booked permanently
    const existingBooking = await Booking.findOne({
      where: { seat_id: seatId, showtime_id: showtimeId, booking_status: "confirmed" }
    });
    if (existingBooking) return res.status(400).json({ message: "Seat already booked" });

    // 2️⃣ create booking
    const booking = await Booking.create({
      seat_id: seatId,
      showtime_id: showtimeId,
      user_id: userId,
      total_price,
      booking_status: "confirmed"
    });

    // 3️⃣ remove temporary lock if exists
    const key = `${showtimeId}-${seatId}`;
    if (seatLocks.has(key)) seatLocks.delete(key);

    // 4️⃣ emit to all clients in the hall-showtime room
    const io = req.app.get("io");
    io.to(`hall-${hallId}-showtime-${showtimeId}`).emit("seat-booked", { seatId });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};