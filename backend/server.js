import express from "express";
import dotenv from "dotenv"
import authRouter from './routes/auth.route.js'

dotenv.config()
const app = express();

app.use("/api/auth", authRouter)

const   PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`the server is running on ${PORT}`));





