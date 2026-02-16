import Hall from "../model/hall.model.js";
import Movie from "../model/movie.model.js";
import Showtime from "../model/showtime.model.js";


const timeToMinute = (timestring) => {
  if (!timestring) return null;

  const [hourStr, minuteStr] = timestring.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    Number.isInteger(hour) && Number.isInteger(minute) &&
    hour >= 0 && hour <= 23 &&
    minute >= 0 && minute <= 59
  ) {
    return hour * 60 + minute;
  } else {
    throw new Error("Invalid time string: " + timestring);
  }
}


const minuteToTime = (minutes) => {
  minutes = minutes % (24 * 60);
  const hour = Math.floor(minutes / 60);
  const remainingMinute = minutes % 60;

  const paddedHour = String(hour).padStart(2, "0");
  const paddedMinute = String(remainingMinute).padStart(2, "0");

  return `${paddedHour}:${paddedMinute}`;
}

const createShowtime = async (req, res) => {
  try {
    const { movieId, hallId } = req.params
    if (!movieId || !hallId) {
      return res.status(400).json({
        success: false,
        message: "Movie Id and Hall ID are needed"
      })
    }

    const movie = await Movie.findOne({ where: { id: movieId } })
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "No Movies Found"
      })
    }
    const hall = await Hall.findOne({ where: { id: hallId } })
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "No Hall Found"
      })
    }

    const { show_date, start_time } = req.body

    if (!show_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: "Show date and start time must be defined"
      })
    } 
    
    end_time = minuteToTime(timeToMinute(start_time) + movie.duration)
      
    const showtime = await Showtime.create({
      show_date,
      start_time,
      end_time
    })

    return res.status(201).json({
      success: true,
      data: showtime
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const updateShowTime = async (req, res) => {
  try {
    const { showtimeId } = req.params
    const showtime = await Showtime.findByPk(showtimeId)

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime has not found"
      })
    }

    const movie = await Movie.findByPk(showtime.movie_id)

    const { show_date, start_time, end_time } = req.body
    
    end_time = minuteToTime(timeToMinute(start_time) + movie.duration)

    await showtime.update({
      show_date,
      start_time,
      end_time
    })

    return res.status(200).json({
      success: true,
      data: showtime
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.findAll();
    res.json({ success: true, data: showtimes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params
    const movie = await Movie.findByPk(movieId)

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "No movies found"
      })
    }

    const showtime = await Showtime.findAll({ where: { movie_id : movieId } })
    
    return res.status(200).json({
      success: true,
      data: showtime
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

const getShowtimesByHall = async (req, res) => {
  try {
    const { hallId } = req.params
    const hall = await Hall.findByPk(hallId)

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "No movies found"
      })
    }

    const showtime = await Showtime.findAll({ where: { movie_id: hallId } })

    return res.status(200).json({
      success: true,
      data: showtime
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

const deleteShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params
    const showtime = await Showtime.findByPk(showtimeId)

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime doesnot exist"
      })
    }

    await showtime.destroy()
    return res.status(200).json({
      success: true,
      message: "Showtime has been deleted"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

export {
  createShowtime,
  updateShowTime,
  getShowtimes,
  getShowtimesByMovie,
  getShowtimesByHall,
  deleteShowtime
};
