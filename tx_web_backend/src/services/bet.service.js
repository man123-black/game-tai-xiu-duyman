import Bet from "../models/Bet.js";
import GameRound from "../models/GameRound.js";
import { rollDice, calcResult } from "./dice.service.js";
import { updateBalance } from "./wallet.service.js";

let ROUND_ID = 1;

export const playGame = async (userId, type, amount) => {
  const dice = rollDice();
  const result = calcResult(dice);

  const win = result === type;
  const change = win ? amount : -amount;

  await updateBalance(userId, change);

  await Bet.create({
    userId,
    roundId: ROUND_ID,
    type,
    amount,
    result
  });

  await GameRound.create({
    roundId: ROUND_ID++,
    diceResult: dice,
    result,
    startTime: new Date(),
    endTime: new Date()
  });

  return { dice, result, win };
};
