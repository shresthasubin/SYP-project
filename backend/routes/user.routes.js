import express from 'express'
import { userDelete, userGetAll, userLogin, userRegister, userRoleUpdate } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const userRouter = express.Router()

userRouter.post('/register', userRegister)
userRouter.post('/login', userLogin)
userRouter.get('/get', userGetAll)
userRouter.put('/update/:id', verifyJWT, userRoleUpdate)
userRouter.delete('/delete/:id', verifyJWT, userDelete)

export default userRouter