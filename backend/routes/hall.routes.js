import express from 'express'
import { hallDelete, hallGet, hallGetActive, hallRegister, hallUpdate } from '../controllers/hall.controller.js'
import { verifyJWT, roleCheck } from '../middlewares/auth.middleware.js'
import { upload } from '../utils/multer.js'

const hallRouter = express.Router()

hallRouter.post('/register', verifyJWT, upload.single('hallPoster'), hallRegister)
hallRouter.put('/update/:id', [verifyJWT, roleCheck(['super-admin'])], upload.single('hallPoster'), hallUpdate)
hallRouter.get('/get', [verifyJWT, roleCheck(['super-admin'])], hallGet)
hallRouter.get('/get-active', [verifyJWT, roleCheck(['super-admin'])], hallGetActive)
hallRouter.delete('/delete/:id', [verifyJWT, roleCheck(['super-admin'])], hallDelete)

export default hallRouter