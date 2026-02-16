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
    const intRoomId = parseInt(hallRoomId)
    const hallRoom = await Hallroom.findByPk(intRoomId)
    
    if (!hallRoom) {
      return res.status(404).json({
        success: false,
        message: "Hall room does not exist"
      })
    }

    const { row, column, seatType, type } = req.body
    if (!row || !column || !type) {
      return res.status(400).json({
        success: false,
        message: "row, column, and Type are required"
      });
    }

    const rowInt = parseInt(row)
    const columnInt = parseInt(column)

    if (!Number.isInteger(rowInt) || !Number.isInteger(columnInt) || rowInt <= 0 || columnInt <= 0) {
      return res.status(400).json({
        success: false,
        message: "row and column must be positive integers"
      });
    }

    const existingSeat = await Seat.findOne({
      where: {
        row: rowInt,
        column: columnInt,
        hallroom_id: intRoomId
      }
    })

    if (existingSeat) {
      return res.status(400).json({
        success: false,
        message: "Seat had already exist"
      })
    }

    if (type === "seat") {
      if (!seatType) {
        return res.status(400).json({
          success: false,
          message: "Seat type must be defined for seat"
        })
      }
    }

    const seatNum = await Seat.count({
      where: {
        row: rowInt,
        hallroom_id: intRoomId,
        type: "seat"
      }
    })

    const seatName = `${numberToAlphabet(row)}${seatNum + 1}`

    const seat = await Seat.create({
        seatName: type === "gap"? null: seatName,
        row: rowInt,
        column: columnInt,
        hallroom_id: hallRoomId,
        seatType: type === "gap"? null: seatType,
        type
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
    const intRoomId = parseInt(hallRoomId)
    const seats = await Seat.findAll({
      where: { hallroom_id: intRoomId },
    });

    if (!seats || seats.length === 0) {
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
