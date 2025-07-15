import mongoose from "mongoose";

// Define the post schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient querying
postSchema.index({ author: 1, created: -1 });

// Create the Post model
const Post = mongoose.model("Post", postSchema);

export default Post;
