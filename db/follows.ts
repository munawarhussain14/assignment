import mongoose from "mongoose";

// Define the follows schema
const followsSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  following: {
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
followsSchema.index({ follower: 1, following: 1 }, { unique: true });
followsSchema.index({ follower: 1, created: -1 });
followsSchema.index({ following: 1, created: -1 });

// Create the Follows model
const Follows = mongoose.model("Follows", followsSchema);

export default Follows;
