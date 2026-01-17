const lastBet = new Map();

export const rateLimit = (req, res, next) => {
  const now = Date.now();
  const last = lastBet.get(req.user._id) || 0;

  if (now - last < 1000) {
    return res.status(429).json({ msg: "Bet quá nhanh" });
  }

  lastBet.set(req.user._id, now);
  next();
};
