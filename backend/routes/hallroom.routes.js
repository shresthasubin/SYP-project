import express from 'express'
import { createRoom, deleteRoom } from '../controllers/hallroom.controller.js'

const hallRoomRoute = express.Router()

hallRoomRoute.post("/create-room/:hallId", createRoom)
hallRoomRoute.delete("/delete-room/:roomId", deleteRoom)

export default hallRoomRoute