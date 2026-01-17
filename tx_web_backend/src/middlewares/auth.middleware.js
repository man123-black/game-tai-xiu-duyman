import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    // 1. Lấy token từ header gửi lên
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Không có quyền truy cập (Thiếu Token)" });
    }

    // 2. Giải mã token (Nếu token sai hoặc hết hạn sẽ nhảy xuống catch)
    // Lưu ý: "secret_key_bi_mat" phải giống hệt bên auth.controller.js
    const decoded = jwt.verify(token, "secret_key_bi_mat");

    // 3. Lưu thông tin user vào request để dùng ở bước sau
    req.user = decoded;
    
    next(); // Cho phép đi tiếp
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};