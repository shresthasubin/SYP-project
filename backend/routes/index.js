import express from 'express'
import userRouter from './user.routes.js'
import movieRouter from './movie.routes.js'
import hallRouter from './hall.routes.js'

const router = express.Router()

router.use('/user', userRouter)
router.use('/movie', movieRouter)
router.use('/hall', hallRouter)

export default router