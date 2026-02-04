import Showtime from "../model/showtime.model.js";

const createShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.findAll();
    res.json({ success: true, data: showtimes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createShowtime, getShowtimes };
