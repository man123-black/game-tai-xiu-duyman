import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/auth.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // KIỂM TRA MẬT KHẨU 
    if (password !== confirmPassword) {
        return alert("❌ Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.");
    }

    try {
      const res = await fetch("https://game-tai-xiu-duyman.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Đăng ký thành công! Hãy đăng nhập ngay.");
        navigate("/"); 
      } else {
        // Hiện lỗi từ server 
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
          
          <input
            className="auth-input"
            type="text"
            placeholder="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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