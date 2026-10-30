import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Un=categorized",
    },
    content: {
      type: String,
    },
    image: {
      type: String,
    },

  },{
    timestamps: true,
  }
)

const Post = mongoose.model("Post", postSchema);
export default Post;