import Hall from "../model/hall.model.js";
import Hallroom from "../model/hallroom.model.js";
import Seat from "../model/seat.model.js";

const createRoom = async (req, res) => {
    try {
        let { hallId } = req.params
        hallId = parseInt(hallId)
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

        
        const rowsInt = parseInt(rows)
        const columnsInt = parseInt(columns)
        
        if (!Number.isInteger(rowsInt) || !Number.isInteger(columnsInt)) {
            return res.status(400).json({
                success: false,
                message: "Rows and columns should be integer only"
            })
        }

        if (rowsInt <= 0 || columnsInt <= 0) {
            return res.status(400).json({
                success: false,
                message: "Rows and columns must be greater than 0"
            })
        }

        const existingRoom = await Hallroom.findOne({ where: { roomName, hall_id: hallId } });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "Room already exist"
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
            error: err.message
        })
    }
}

const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params
        const room = await Hallroom.findByPk(roomId)
    
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "No Rows Found"
            })
        }
    
        await Seat.destroy({ where: { hallroom_id: roomId } })
        await room.destroy()
    
        return res.status(200).json({
            success: true,
            message: "Room has been deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error: Room cannot be deleted"
        })
    }
}

export { createRoom, deleteRoom }
