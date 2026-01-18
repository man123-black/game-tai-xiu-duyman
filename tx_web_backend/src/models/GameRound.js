import mongoose from "mongoose";

const gameRoundSchema = new mongoose.Schema({
  roundId: { type: Number, required: true, unique: true }, 
  result: { type: [Number], default: [] }, //kết quả
  status: { type: String, enum: ["BETTING", "ROLLING", "COMPLETED"], default: "BETTING" },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

export default mongoose.model("GameRound", gameRoundSchema);