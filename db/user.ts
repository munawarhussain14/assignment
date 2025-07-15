import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  joined: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
userSchema.index({ userId: 1 });

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
