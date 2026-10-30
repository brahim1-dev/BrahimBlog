import jwt from "jsonwebtoken"
import User from "../models/user.model.js";


export const protectRoute = async(req, res, next )=>{
  try {
    // Let's check if the user has a token or not
    const token = req.cookies?.access_token
    if(!token){
      return res.status(401).json({
        error: "Unauthorized: No Token Provided",
      });
    }
      //Let's Verify the token and get the users data
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded){
      return res.status(401).json({
        error: "Unauthorized: Invalid Token"
      })
    }
    //Let's find the user by id
    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
       return res.status(404).json({
        error: "User Not Found"
      })
    }
    // Add the user to the request object for further use
    req.user=user;

    // move to the next middleware or controller function
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired token"
      });
    }
    console.error(`Error in protect route middleware: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}