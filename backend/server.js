import express from "express";
import dotenv from "dotenv"
import authRouter from './routes/auth.route.js'
import connectMongoDB from "./db/connectDB.js";



dotenv.config()
const app = express();

app.use("/api/auth", authRouter)

const   PORT = process.env.PORT || 3000;

app.listen(PORT, connectMongoDB(), () => 
  console.log(`the server is running on ${PORT}`)
);





