import express from "express";
import { auth } from "../middlewares/auth.middleware.js"; // Import middleware bảo vệ
import { getMe } from "../controllers/user.controller.js";

const router = express.Router();

// API lấy thông tin bản thân (Bắt buộc phải có token mới lấy được)
router.get("/me", auth, getMe);

export default router;