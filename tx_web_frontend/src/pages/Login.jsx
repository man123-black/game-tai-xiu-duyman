import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/auth.css";

// --- IMPORT FIREBASE ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDD5wTIPYYUW8w0jlUVnazYCfgVPnsdR3Y",
  authDomain: "game-tai-xiu-duy-man.firebaseapp.com",
  projectId: "game-tai-xiu-duy-man",
  storageBucket: "game-tai-xiu-duy-man.firebasestorage.app",
  messagingSenderId: "872868930186",
  appId: "1:872868930186:web:7fcc57188b6da104294373",
  measurementId: "G-4P41G53L8T"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 1. XỬ LÝ ĐĂNG NHẬP GOOGLE
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Lưu thông tin tạm thời và vào game
      localStorage.setItem("user", JSON.stringify({
        username: user.displayName,
        balance: 50000 // Số dư mặc định cho lính mới
      }));
      
      alert("Chào mừng đại gia " + user.displayName + "!");
      navigate("/game");
    } catch (error) {
      console.error("Lỗi Google:", error.message);
      alert("Không thể đăng nhập bằng Google!");
    }
  };

  // 2. XỬ LÝ ĐĂNG NHẬP FACEBOOK
  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      localStorage.setItem("user", JSON.stringify({
        username: user.displayName,
        balance: 50000
      }));
      
      alert("Chào mừng " + user.displayName + "!");
      navigate("/game");
    } catch (error) {
      console.error("Lỗi Facebook:", error.message);
      alert("Lỗi: Bạn cần cấu hình App ID Facebook trong Firebase!");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://game-tai-xiu-duyman.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/game"); 
      } else {
        alert(data.message);
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

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>Hoặc đăng nhập bằng</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {/* Sửa lại nút Facebook */}
            <button 
                type="button"
                style={{
                    background: '#1877F2', color: 'white', border: 'none',
                    padding: '8px 15px', borderRadius: '5px', cursor: 'pointer',
                    fontSize: '13px', display: 'flex', alignItems: 'center',
                    gap: '8px', fontWeight: 'bold'
                }}
                onClick={handleFacebookLogin} // THAY alert BẰNG HÀM NÀY
            >
                <span style={{fontSize: '16px'}}>f</span> Facebook
            </button>

            {/* Sửa lại nút Google */}
            <button 
                type="button"
                style={{
                    background: 'white', color: '#444', border: 'none',
                    padding: '8px 15px', borderRadius: '5px', cursor: 'pointer',
                    fontSize: '13px', display: 'flex', alignItems: 'center',
                    gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onClick={handleGoogleLogin} // THAY alert BẰNG HÀM NÀY
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="16" alt="google" />
                Google
            </button>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="16" alt="google" />
                Google
              </button>
          </div>
        </div>

        <Link to="/register" className="auth-link" style={{ marginTop: '20px', display: 'block' }}>
          Chưa có tài khoản? <span>Đăng ký ngay</span>
        </Link>
      </div>
    </div>
  );
};

export default Login;