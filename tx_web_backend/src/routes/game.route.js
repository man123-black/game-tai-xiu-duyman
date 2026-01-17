import express from "express";
import { bet } from "../controllers/game.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();
import { rateLimit } from "../middlewares/rateLimit.js";

router.post("/bet", auth, rateLimit, bet);


export default router;
