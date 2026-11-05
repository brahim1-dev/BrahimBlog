import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      default: "",
    },
  }, {
    timestamp: true
  } //CreatedAt , UpdatedAt
)


const User = mongoose.model("User", userSchema)
export default User;