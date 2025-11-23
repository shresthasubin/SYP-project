import express from 'express'
import { sequelize,conenctDB } from './db/index.js'
import dotenv from 'dotenv'
import cors from 'cors';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';

dotenv.config({
    path: './.env'
})

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

app.use('/api',router)

import './model/user.model.js'

const startServer = async () => {
    await conenctDB();
    await sequelize.sync({force:false})
    app.listen(port, () => {
        console.log(`App is listening at PORT: [${port}]`)
    })
}

startServer()