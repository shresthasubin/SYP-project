import Booking from "../model/booking.model.js";
import BookingSeat from "../model/bookingSeat.model.js";
import Showtime from "../model/showtime.model.js";
import Movie from "../model/movie.model.js";
import Hall from "../model/hall.model.js";
import Payment from "../model/payment.model.js";

const createBooking = async (req, res) => {
  try {
    const { showtime_id } = req.params
    if (!showtime_id) {
      return res.status(400).json({
        success: false,
        message: "Showtime Id is needed"
      })
    }
    
    const { seats } = req.body;

    const booking = await Booking.create({
      user_id: req.user.id,
      showtime_id,
      total_price,
    });

    for (const seatId of seats) {
      await BookingSeat.create({
        booking_id: booking.id,
        seat_id: seatId,
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Showtime,
          include: [Movie, Hall],
        },
        {
          model: Payment,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Booking history fetched",
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createBooking ,getMyBookings};
