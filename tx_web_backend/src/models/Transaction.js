import mongoose from "mongoose";

export default mongoose.model(
  "Transaction",
  new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    type: String,
    createdAt: { type: Date, default: Date.now }
  })
);
