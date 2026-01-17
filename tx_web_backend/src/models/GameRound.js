import mongoose from "mongoose";

const gameRoundSchema = new mongoose.Schema({
  roundId: { type: Number, required: true, unique: true }, // Phiên số bao nhiêu
  result: { type: [Number], default: [] }, // Mảng 3 số [1, 5, 6]
  status: { type: String, enum: ["BETTING", "ROLLING", "COMPLETED"], default: "BETTING" },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

export default mongoose.model("GameRound", gameRoundSchema);