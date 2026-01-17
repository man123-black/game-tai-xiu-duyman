import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/auth.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Lưu token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // --- SỬA Ở ĐÂY: XÓA ALERT, VÀO THẲNG GAME ---
        navigate("/game"); 
      } else {
        alert(data.message); // Chỉ hiện thông báo nếu LỖI (sai mật khẩu/tài khoản)
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Đăng Nhập</h1>
        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="text"
            placeholder="Tên tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-btn" type="submit">VÀO GAME</button>
        </form>
        <Link to="/register" className="auth-link">
          Chưa có tài khoản? <span>Đăng ký ngay</span>
        </Link>
      </div>
    </div>
  );
};

export default Login;