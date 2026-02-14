import Hallroom from "../model/hallroom.model.js";
import Seat from "../model/seat.model.js";

const numberToAlphabet = (n) => {
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

const createSeat = async (req, res) => {
  try {
    const { hallRoomId } = req.params
    const hallRoom = await Hallroom.findByPk(hallRoomId)
    
    if (!hallRoom) {
      return res.status(404).json({
        success: false,
        message: "Hall room does not exist"
      })
    }

    const { row, column, seatType } = req.body
    if (!row || !column || !seatType) {
      return res.status(400).json({
        success: false,
        message: "row, column, and seatType are required"
      });
    }

    if (!Number.isInteger(row) || !Number.isInteger(column) || row <= 0 || column <= 0) {
      return res.status(400).json({
        success: false,
        message: "row and column must be positive integers"
      });
    }
    const seatName = `${numberToAlphabet(row)}${column}`

    const seat = await Seat.create({
      seatName,
      row,
      column,
      hallroom_id: hallRoomId,
      seatType
    })

    return res.status(201).json({
      success: true,
      message: "Seat created successfully",
      data: seat
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error: Failed to create seat",
      error: err.message
    });
  }
};

const getSeatsByHall = async (req, res) => {
  try {
    const { hallRoomId } = req.params

    const seats = await Seat.findAll({
      where: { hallroom_id: hallRoomId },
    });

    if (!seats) {
      return res.status(404).json({
        success: false,
        message: "No seats available"
      })
    }

    return res.status(200).json({
      success: true,
      data: seats
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export { createSeat, getSeatsByHall };
