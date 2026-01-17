import { playGame } from "../services/bet.service.js";

export const bet = async (req, res) => {
  const { type, amount } = req.body;
  const userId = req.user._id;

  const data = await playGame(userId, type, amount);
  res.json(data);
};
