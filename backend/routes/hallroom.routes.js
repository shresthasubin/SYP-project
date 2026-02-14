import express from 'express'
import { createRoom } from '../controllers/hallroom.controller'

const hallRoomRoute = express.Router()

hallRoomRoute.post("/create-room/:hallId", createRoom)

export default hallRoomRoute