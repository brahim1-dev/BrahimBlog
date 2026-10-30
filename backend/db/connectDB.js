import mongoose from "mongoose";

const connectMongoDB = async () =>{
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`Connected To MongoDB Successfully: ${conn.connection.host}`)
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error.message}`, { cause: error })
  }
}

export default connectMongoDB;