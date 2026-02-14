import express from 'express'
import { createRoom } from '../controllers/hallroom.controller.js'

const hallRoomRoute = express.Router()

hallRoomRoute.post("/create-room/:hallId", createRoom)

export default hallRoomRoute