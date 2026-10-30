import User from "../models/user.model";

export const createPost = async(req, res)=>{
  
  try {
    // 1. Destructuring post content from request body
    const {content, title, category} = res.body;

    // 2. Get authenticated user ID and convert to String
    const userId = req.uer._id.toString();

    // 3. Verify user exists in database;
    const user = await User.findById(userId);

    if(!user){
      return res.status(401).json({
        error: "You are not authenticated"
      })
    }
    // 4. Validate post content required
    if(!content){
      //TODO: also Check if the post contains image or not
      return res.status(400).json({
        error: "Post must contain both content and image"
      })
    }
    //TODO: handle image upload

    // Create New Post
    const newPost = new Post({
      content, 
      title,
      category,
      author: userId,
      //TODO:  image
    })

    // Let's Save the post
    await newPost.save();

    // return created post
    res.status(202).json(newPost)


  } catch (error) {
    console.error(`Error in Create Post Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}


export const getAllPosts = async(req, res)=>{

}


export const getPostById = async(req, res)=>{

}


export const updatePost = async(req, res)=>{

}


export const deletePost = async(req, res)=>{

}


export const getUserPosts = async(req, res)=>{

}














