import express from 'express'
import { userDelete, userGetAll, userLogin, userRegister, userRoleUpdate } from '../controllers/user.controller.js'
import { verifyJWT, roleCheck } from '../middlewares/auth.middleware.js'

const userRouter = express.Router()

userRouter.post('/register', userRegister)
userRouter.post('/login', userLogin)
userRouter.get('/get', userGetAll)
userRouter.put('/update/:id', [verifyJWT, roleCheck(['super-admin'])], userRoleUpdate)
userRouter.delete('/delete/:id', [verifyJWT, roleCheck(['super-admin'])], userDelete)

export default userRouter