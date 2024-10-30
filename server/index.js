import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import userRoute from './router/userRoute.js'
import { PORT } from './config/dotenv.js'

dotenv.config()
const app = express()

app.use(cookieParser())
app.use(express.json())

app.use(`/api/user`, userRoute)

app.listen(PORT, ()=>{
    console.log(`Server is listening to port ${PORT}`)
})