import express from "express";
import Bet from "../models/Bet.js";
import GameRound from "../models/GameRound.js";

const router = express.Router();

router.get("/history", async (req, res) => {
  const rounds = await GameRound.find().sort({ roundId: -1 }).limit(50);
  const bets = await Bet.find().sort({ _id: -1 }).limit(100);
  res.json({ rounds, bets });
});

export default router;
