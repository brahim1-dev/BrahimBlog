import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; 
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

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
          return res.status(201).json({
            _id:newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email
          })
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
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    });

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