import Hall from "../model/hall.model.js";
import Hallroom from "../model/hallroom.model.js";

const createRoom = async (req, res) => {
    try {
        const { hallId } = req.params
        const hall = await Hall.findByPk(hallId)

        if (!hall) {
            return res.status(404).json({
                success: false,
                message: "No hall exist"
            })
        }

        const { roomName, rows, columns } = req.body

        if (!roomName || !rows || !columns) {
            return res.status(400).json({
                success: false,
                message: "All the details must be filled"
            })
        }

        if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows <= 0 || columns <=0) {
            return res.status(400).json({
                success: false,
                message: "Rows and columns must be greater than 0 and should be integer only"
            })
        }

        const room = await Hallroom.create({
            roomName,
            totalRows: rows,
            totalColumns: columns,
            capacity: rows * columns,
            hall_id: hallId
        })

        res.status(201).json({
            success: true,
            message: "Hall room has been created successfully",
            data: room
        })

        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error: Cannot create hall room",
            error: err
        })
    }
}

export { createRoom }
