import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Không có quyền truy cập (Thiếu Token)" });
    }

    const decoded = jwt.verify(token, "secret_key_bi_mat");

    req.user = decoded;
    
    next(); 
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};