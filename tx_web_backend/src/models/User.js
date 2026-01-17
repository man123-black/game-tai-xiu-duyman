import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000000 }, // Tặng 1 củ khởi nghiệp
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);