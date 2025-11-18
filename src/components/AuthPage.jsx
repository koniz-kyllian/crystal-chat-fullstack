// src/components/AuthPage.jsx
import { useState } from "react";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  // State lưu trữ những gì người dùng đang gõ
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn reload trang
    if (!username.trim()) return; // Nếu chưa nhập gì thì thôi

    // Gửi tên người dùng ngược lên App.jsx
    onLogin(username);
  };

  return (
    <div className="glass-card" style={{ maxWidth: "400px", width: "90%" }}>
      <h2 style={{ marginBottom: "20px", fontSize: "2rem" }}>
        {isLogin ? "Welcome Back" : "Join Crystal"}
      </h2>
      <p style={{ marginBottom: "30px", opacity: 0.7 }}>
        {isLogin ? "Enter your name to chat" : "Create a nickname"}
      </p>

      <form onSubmit={handleSubmit}>
        {/* Ô nhập Username - QUAN TRỌNG NHẤT */}
        <input
          type="text"
          placeholder="Your Nickname..."
          className="glass-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Lưu chữ đang gõ vào state
          required
        />

        {/* Ô mật khẩu (Để làm cảnh cho đẹp vì chưa có Database) */}
        <input
          type="password"
          placeholder="Password (Optional)"
          className="glass-input"
        />

        <button className="glass-button">
          {isLogin ? "Enter Chat" : "Join Now"}
        </button>
      </form>

      <div className="switch-text" onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have a nickname? Create one"
          : "Already have a nickname? Join now"}
      </div>
    </div>
  );
};

export default AuthPage;
