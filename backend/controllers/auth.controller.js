import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import bcrypt from "bcryptjs"; 
import {v2 as cloudinary} from "cloudinary";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { deleteCloudinaryImage } from "../utils/cloudinaryImage.js";

const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  profileImage: user.profileImage || "",
  role: user.role || "user",
})

export const test = (req, res)=>{
  res.json({message: "The api is working"})
}


export const register = async (req, res) =>{
  try {
    const {fullName, username, email, password} =req.body

    //Let's check if they all the field are available
    if(!fullName || !username || !email  || !password ){
      return res.status(400).json({
        error: "Fill all the fields",
      });
    }
    // Let's Check if the email is in the correct format
    // this is long form const emailRex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   // this is short form
    const emailRex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if(!emailRex.test(email)){
        return res.status(400).json({
          error: "Invalid Email Format"
        })
      }

      // Let's Check if the user with the same email already exist
      const existingEmail = await User.findOne({email});
        if(existingEmail){
          return res.status(400).json({
            error:"User With This Email Already Exists"
          });
        }

      // Let's Check if the user with the same username already exist
      const existingUUsername = await User.findOne({username});
        if(existingUUsername){
          return res.status(400).json({
            error:"User With This username Already Exists"
          });
        }

        // Let's check the password is at least 6 character long
        if (password.length <6){
          return res.status(400).json({
            error: "Password must be at least 6 character long"
          })
        }

        // Let's Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10 );

        // let's create new user
        const newUser = new User({
          fullName,
          username,
          email, 
          password:hashedPassword
        })
        if(newUser){
          // Let's save the user
          await newUser.save()
          generateTokenAndSetCookie(newUser._id, res)
          return res.status(201).json(publicUser(newUser))
        }else{
          return res.status(400).json({
            error:"Invalid User Data"
          })
        }
  } catch (error) {
    console.log(`Error in signup controller: ${error.message}`)
    return res.status(500).json({error: "Internal server error"})
  }
}

export const login = async (req, res) =>{
  try {
    const {username, password} = req.body;
    // check if the fields are empty
    if(!username || !password) {
      return res.status(400).json({
        error: "Username and Password are required"
      })
    }

    // Check if the user exist
    const user = await User.findOne({username})
    if(!user){
      return res.status(404).json({
        error: `User with the ${username} username doesn't exist`
      })
    }

    // Compare the password
    const isPasswordCorrect = bcrypt.compareSync(password, user?.password)
    if(!isPasswordCorrect){
      return res.status(400).json({
        error: "Invalid Credentials"
      })
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json(publicUser(user));

  } catch (error) {
    console.error(`Error in login controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}

export const logout = (req, res)=>{
  try {
    res.clearCookie("access_token");
    res.status(200).json({
      message: "Logged Out successfully"
    })
  } catch (error) {
    console.error(`Error in login controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}

export const getMe = (req, res) => {
  return res.status(200).json(publicUser(req.user))
}

export const updateProfile = async (req, res) => {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : ""
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""

    if (!fullName || !email) {
      return res.status(400).json({ error: "Name and email are required" })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address" })
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    })
    if (existingUser) {
      return res.status(409).json({ error: "That email address is already in use" })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ error: "User not found" })

    const previousProfileImage = user.profileImage
    user.fullName = fullName
    user.email = email

    if (Object.hasOwn(req.body, "profileImage")) {
      const { profileImage } = req.body

      if (profileImage === null || profileImage === "") {
        user.profileImage = ""
      } else if (typeof profileImage === "string" && /^data:image\/[\w.+-]+;base64,/i.test(profileImage)) {
        const uploadedImage = await cloudinary.uploader.upload(profileImage, { folder: "profile-images" })
        user.profileImage = uploadedImage.secure_url
      } else if (typeof profileImage === "string") {
        try {
          const imageUrl = new URL(profileImage)
          if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error()
          user.profileImage = imageUrl.toString()
        } catch {
          return res.status(400).json({ error: "Profile image must be a valid HTTP or HTTPS URL" })
        }
      } else {
        return res.status(400).json({ error: "Profile image is invalid" })
      }
    }

    await user.save()
    if (previousProfileImage && previousProfileImage !== user.profileImage) {
      await deleteCloudinaryImage(previousProfileImage)
    }

    return res.status(200).json(publicUser(user))
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "That email address is already in use" })
    }
    console.error(`Error updating profile: ${error.message}`)
    return res.status(500).json({ error: "Unable to update your profile" })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" })
    }

    const user = await User.findById(req.user._id)
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return res.status(200).json({ message: "Password updated successfully" })
  } catch (error) {
    console.error(`Error changing password: ${error.message}`)
    return res.status(500).json({ error: "Unable to change your password" })
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ error: "Enter your password to delete your account" })

    const user = await User.findById(req.user._id)
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Password is incorrect" })
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return res.status(409).json({ error: "The last admin account cannot be deleted" })
      }
    }

    const posts = await Post.find({ author: user._id }).select("image")
    await Post.deleteMany({ author: user._id })
    await User.findByIdAndDelete(user._id)

    await Promise.all([
      deleteCloudinaryImage(user.profileImage),
      ...posts.map((post) => deleteCloudinaryImage(post.image)),
    ])

    res.clearCookie("access_token")
    return res.status(200).json({ message: "Account and posts deleted successfully" })
  } catch (error) {
    console.error(`Error deleting account: ${error.message}`)
    return res.status(500).json({ error: "Unable to delete your account" })
  }
}