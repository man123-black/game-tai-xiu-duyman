import User from "../models/User.js";

export const updateBalance = async (userId, amount) => {
  return User.findByIdAndUpdate(
    userId,
    { $inc: { balance: amount } },
    { new: true }
  );
};
