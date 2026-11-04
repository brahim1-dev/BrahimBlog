import dotenv from "dotenv"
import mongoose from "mongoose"
import connectMongoDB from "../db/connectDB.js"
import User from "../models/user.model.js"

dotenv.config()

const username = process.argv[2]?.trim()

if (!username) {
  console.error("Usage: npm run make-admin -- <username>")
  process.exitCode = 1
} else {
  try {
    await connectMongoDB()
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { role: "admin" } },
      { new: true, runValidators: true },
    ).select("username role")

    if (!user) {
      console.error(`User not found: ${username}`)
      process.exitCode = 1
    } else {
      console.log(`Admin role granted to ${user.username}`)
    }
  } catch (error) {
    console.error(`Unable to grant admin role: ${error.message}`)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}