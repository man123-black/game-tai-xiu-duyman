import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/auth.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Thêm state cho ô nhập lại
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. KIỂM TRA MẬT KHẨU CÓ KHỚP KHÔNG
    if (password !== confirmPassword) {
        return alert("❌ Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Chỉ gửi username và password lên server (không cần gửi confirmPassword)
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Đăng ký thành công! Hãy đăng nhập ngay.");
        navigate("/"); 
      } else {
        // Hiện lỗi từ server (ví dụ: Tên đã tồn tại)
        alert("❌ " + data.message); 
      }
    } catch (error) {
      alert("⚠️ Lỗi kết nối server!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Đăng Ký Vip</h1>
        <form onSubmit={handleRegister}>
          
          {/* Ô Nhập Tên */}
          <input
            className="auth-input"
            type="text"
            placeholder="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required // Bắt buộc nhập
          />

          {/* Ô Nhập Mật Khẩu */}
          <input
            className="auth-input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Ô Nhập Lại Mật Khẩu (Mới thêm) */}
          <input
            className="auth-input"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="auth-btn" type="submit">ĐĂNG KÝ</button>
        </form>
        
        <Link to="/" className="auth-link">
          Đã có tài khoản? <span>Đăng nhập</span>
        </Link>
      </div>
    </div>
  );
};

export default Register;