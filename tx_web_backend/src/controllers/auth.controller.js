import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Đăng ký
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. KIỂM TRA TRÙNG TÊN (QUAN TRỌNG)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "Tên tài khoản này đã có người dùng!" });
    }

    // 2. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo user mới (Tặng 5 củ)
    const newUser = await User.create({
      username,
      password: hashedPassword,
      balance: 5000000 
    });

    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại!" });

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

    // Tạo token
    const token = jwt.sign({ id: user._id }, "secret_key_bi_mat", { expiresIn: "1d" });

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};