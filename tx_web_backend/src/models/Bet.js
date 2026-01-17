import mongoose from "mongoose";

export default mongoose.model(
  "Bet",
  new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    roundId: Number,
    type: String,
    amount: Number,
    result: String
  })
);
