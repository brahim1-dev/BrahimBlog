import mongoose from "mongoose"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import { deleteCloudinaryImage } from "../utils/cloudinaryImage.js"

export const getUsers = async (req, res) => {
  try {
    const [users, postCounts] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).lean(),
      Post.aggregate([
        { $group: { _id: "$author", count: { $sum: 1 } } },
      ]),
    ])
    const countsByUserId = new Map(postCounts.map(({ _id, count }) => [String(_id), count]))

    return res.status(200).json(users.map((user) => ({
      ...user,
      role: user.role || "user",
      isActive: user.isActive !== false,
      postCount: countsByUserId.get(String(user._id)) || 0,
    })))
  } catch (error) {
    console.error(`Error loading admin users: ${error.message}`)
    return res.status(500).json({ error: "Unable to load users" })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" })
    }
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be user or admin" })
    }
    if (String(req.user._id) === userId && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin role" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } })
      if (adminCount <= 1) {
        return res.status(409).json({ error: "The last admin cannot be demoted" })
      }
    }

    user.role = role
    await user.save()

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || "",
      role: user.role,
    })
  } catch (error) {
    console.error(`Error updating user role: ${error.message}`)
    return res.status(500).json({ error: "Unable to update user role" })
  }
}

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const { isActive } = req.body

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" })
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be true or false" })
    }
    if (String(req.user._id) === userId && !isActive) {
      return res.status(400).json({ error: "You cannot disable your own account" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    if (!isActive && user.role === "admin" && user.isActive !== false) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: { $ne: false },
      })
      if (activeAdminCount <= 1) {
        return res.status(409).json({ error: "The last active admin cannot be disabled" })
      }
    }

    user.isActive = isActive
    await user.save()
    return res.status(200).json({ _id: user._id, isActive: user.isActive })
  } catch (error) {
    console.error(`Error updating user status: ${error.message}`)
    return res.status(500).json({ error: "Unable to update user status" })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" })
    }
    if (String(req.user._id) === userId) {
      return res.status(400).json({ error: "Use your profile settings to delete your own account" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } })
      if (adminCount <= 1) {
        return res.status(409).json({ error: "The last admin cannot be deleted" })
      }
    }

    const posts = await Post.find({ author: user._id }).select("image")
    await Post.deleteMany({ author: user._id })
    await User.findByIdAndDelete(user._id)
    await Promise.all([
      deleteCloudinaryImage(user.profileImage),
      ...posts.map((post) => deleteCloudinaryImage(post.image)),
    ])

    return res.status(200).json({ message: "User and their posts deleted successfully" })
  } catch (error) {
    console.error(`Error deleting user: ${error.message}`)
    return res.status(500).json({ error: "Unable to delete user" })
  }
}