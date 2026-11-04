import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary"

const resolvePostImage = async (image) => {
  if (!image) return { image }
  if (typeof image !== "string") {
    return { error: "Image must be a valid image URL or uploaded image" }
  }

  if (/^data:image\/[\w.+-]+;base64,/i.test(image)) {
    const uploadImage = await cloudinary.uploader.upload(image)
    return { image: uploadImage.secure_url }
  }

  try {
    const imageUrl = new URL(image)
    if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error()
    return { image: imageUrl.toString() }
  } catch {
    return { error: "Image must be a valid HTTP or HTTPS URL" }
  }
}

export const createPost = async(req, res)=>{
  
  try {
    // 1. Destructuring post content from request body
    const {content, title, category} = req.body ;
    let {link} = req.body;
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
    if (image) {
      const resolvedImage = await resolvePostImage(image)
      if (resolvedImage.error) {
        return res.status(400).json({ error: resolvedImage.error })
      }
      image = resolvedImage.image
    }

    if (link) {
      try {
        const parsedLink = new URL(link)
        if (!["http:", "https:"].includes(parsedLink.protocol)) throw new Error()
        link = parsedLink.toString()
      } catch {
        return res.status(400).json({ error: "Link must be a valid HTTP or HTTPS URL" })
      }
    }

    // Create New Post
    const newPost = new Post({
      content, 
      title,
      category,
      author: userId,
      image,
      link,
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
  try {
    // get post ID from the request parameters
    const {id} = req.params;
    // get new content for the post from the request body
    const {content, title, category} = req.body ;
    let {image, link} = req.body;

    // Find the post user's by ID
    const userId = req.user._id.toString();

    // Find the post by ID
    const post = await Post.findById(id);
    if(!post){
      return res.status(404).json({
        error: "Post not found"
      })
    }

    // Check if the authenticated user is the author of the post
    if(post.author.toString() !== userId){
      return res.status(403).json({
        error: "You are not authorized to update this post"
      })
    }

    // validate updated: at least one field should be provided for update
    if(!content && !title && !category && !image && !link){
      return res.status(400).json({
        error: "At least one field must be provided for update"
      })
    }

    //New image upload handling
    if (image) {
      const resolvedImage = await resolvePostImage(image)
      if (resolvedImage.error) {
        return res.status(400).json({ error: resolvedImage.error })
      }
      image = resolvedImage.image
    }

    if (link) {
      try {
        const parsedLink = new URL(link)
        if (!["http:", "https:"].includes(parsedLink.protocol)) throw new Error()
        link = parsedLink.toString()
      } catch {
        return res.status(400).json({ error: "Link must be a valid HTTP or HTTPS URL" })
      }
    }

    // Update the post with new values
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content, title, category, image, link },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedPost);

  } catch (error) {
    console.log(`Error in updatePost Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}

export const deletePost = async(req, res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        error: "Post not found"
      })
    }
    if(post.author.toString() !== req.user._id.toString()){
      return res.status(403).json({
        error: "Unauthorized to delete this post"
      })
    }
    
    //let's delete the post
    if(post.image){
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      error: "Post deleted successfully"
    })

 } catch (error) {
    console.log(`Error in delete post Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}


export const getUserPosts = async(req, res)=>{
  try {
   const {username} = req.params;
   const user = await User.findOne({username});
   if(!user){
    return res.status(404).json({
      error: "User not found"
    })
   }
  const posts = await Post.find({author: user._id})
    .sort({createdAt: -1})
    .populate({path: "author", select: "-password"})

  res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in getUsers post Controller: ${error.message}`)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
}







