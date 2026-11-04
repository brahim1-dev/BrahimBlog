import express from "express";
import dotenv from "dotenv"
import authRouter  from './routes/auth.route.js'
import adminRouter from './routes/admin.route.js'
import connectMongoDB from "./db/connectDB.js";
import postRouter from "./routes/post.route.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary"

dotenv.config()

// Cloudinary Configuration;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json({ limit: "10mb" })) // express allows know json , if you are post data in you thunder client
app.use(cookieParser())


app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)
app.use("/api/admin", adminRouter)

const   PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () =>
    console.log(`the server is running on ${PORT}`)
  );
};

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exitCode = 1;
});
