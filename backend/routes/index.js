import express from 'express'
import userRouter from './user.routes.js'
import movieRouter from './movie.routes.js'
import hallRouter from './hall.routes.js'
import hallRoomRoute from './hallroom.routes.js'
import seatRoute from './seat.routes.js'
import showtimeRoute from './showtime.routes.js'
import chatRoutes from './chat.routes.js'
<<<<<<< HEAD
import ticketRoute from './ticket.route.js'
=======
import bookingRouter from './booking.routes.js'
>>>>>>> 8508776087336c0f8584857c7a9e5eb4e1d5f01a

const router = express.Router()

router.use('/user', userRouter)
router.use('/movie', movieRouter)
router.use('/hall', hallRouter)
router.use('/hall-room', hallRoomRoute)
router.use('/seat', seatRoute)
router.use('/showtime', showtimeRoute)
router.use('/chat', chatRoutes)
<<<<<<< HEAD
router.use('/ticket', ticketRoute)
=======
router.use("/bookings", bookingRouter)
>>>>>>> 8508776087336c0f8584857c7a9e5eb4e1d5f01a

export default router
