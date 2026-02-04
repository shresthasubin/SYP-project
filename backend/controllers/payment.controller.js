import Payment from "../model/payment.model.js";
import Booking from "../model/booking.model.js";
import Showtime from "../model/showtime.model.js";
import Movie from "../model/movie.model.js";
const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Booking,
          where: { user_id: req.user.id },
          include: [
            {
              model: Showtime,
              include: [Movie],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createPayment };
