import Seat from "../model/seat.model.js";

const createSeat = async (req, res) => {
  try {
    const { hall_id, seat_number, row_label } = req.body;

    const seat = await Seat.create({ hall_id, seat_number, row_label });

    res.status(201).json({
      success: true,
      message: "Seat created",
      data: seat,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSeatsByHall = async (req, res) => {
  try {
    const seats = await Seat.findAll({
      where: { hall_id: req.params.hallId },
    });

    res.json({ success: true, data: seats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createSeat, getSeatsByHall };
