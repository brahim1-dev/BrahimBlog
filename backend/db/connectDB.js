import mongoose from "mongoose";

const connectMongoDB = async () =>{
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`Connected To MongoDB Successfully: ${conn.connection.host}`)
  } catch (error) {
    console.log(`Error Connection to mongodb : ${error.message}`)
  }
}

export default connectMongoDB;