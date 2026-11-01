import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary"

export const createPost = async(req, res)=>{
  
  try {
    // 1. Destructuring post content from request body
    const {content, title, category} = req.body ;
    let {image } = req.body;

    // 2. Get authenticated user ID and convert to String
    const userId = req.user._id.toString();

    // 3. The protectRoute middleware verifies the authenticated user.
    // 4. Validate post content required
    if(!title || !content){
      //TODO: also Check if the post contains image or not
      return res.status(400).json({
        error: "Title and content are required"
      })
    }
    //TODO: handle image upload
    if(image){
      const uploadImage = await cloudinary.uploader.upload(image);
      image = uploadImage.secure_url;
    }

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
    return res.status(201).json(newPost)


  } catch (error) {
    console.error(`Error in Create Post Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}


export const getAllPosts = async(req, res)=>{
  try {
    
    //. Fetch all the post 
    const posts = await Post.find() //get all Posts without filtering
    .sort({createdAt: -1})
    .populate({path: "author", select: "-password"})

    //Check the result
    if (posts.length === 0){
      return res.status(200).json([])
    }

    //return posts
    return res.status(200).json(posts);

  } catch (error) {
    console.log(`Error in getAll Posts Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}


export const getPostById = async(req, res)=>{
  try {
    const post = await Post.findById(req.params.id)
    .populate({path: "author", select: "-password"})
    if(!post){
      return res.status(404).json({
        error: "Post not found"
      })
    }
    return res.status(200).json(post);
    
  } catch (error) {
    console.log(`Error in getPostById Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}

export const updatePost = async(req, res)=>{

}


export const deletePost = async(req, res)=>{

}


export const getUserPosts = async(req, res)=>{

}










