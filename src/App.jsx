// src/App.jsx
import { useState } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage";
import RoomPage from "./components/RoomPage"; // Nhớ import trang chọn phòng
import ChatPage from "./components/ChatPage";
import io from "socket.io-client";

// Kết nối Socket 1 lần duy nhất ở đây
const socket = io.connect("http://localhost:3001");

const THEMES = [
  {
    id: "default",
    name: "🦄 Cotton Candy",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "neon",
    name: "🌃 Cyberpunk City",
    url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "nature",
    name: "🌿 Misty Forest",
    url: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2592&auto=format&fit=crop",
  },
  {
    id: "dark",
    name: "🌑 Deep Space",
    url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop",
  },
];

function App() {
  const [user, setUser] = useState(null); // Tên người dùng
  const [room, setRoom] = useState(null); // ID Phòng (quan trọng)
  const [currentBg, setCurrentBg] = useState(THEMES[0].url);

  return (
    <div
      className="app-container"
      style={{ backgroundImage: `url(${currentBg})` }}
    >
      {/* --- LUỒNG ĐIỀU HƯỚNG 3 BƯỚC --- */}

      {!user ? (
        // BƯỚC 1: CHƯA CÓ TÊN -> HIỆN TRANG ĐĂNG NHẬP
        <AuthPage onLogin={(username) => setUser(username)} />
      ) : !room ? (
        // BƯỚC 2: CÓ TÊN NHƯNG CHƯA CÓ PHÒNG -> HIỆN TRANG CHỌN PHÒNG
        <RoomPage
          socket={socket}
          username={user}
          onJoinRoom={(roomId) => setRoom(roomId)}
        />
      ) : (
        // BƯỚC 3: ĐỦ TÊN VÀ PHÒNG -> VÀO CHAT
        <ChatPage
          socket={socket}
          username={user}
          room={room}
          // QUAN TRỌNG: Truyền hàm này xuống để ChatPage gọi khi bấm "Leave Room"
          onLeaveRoom={() => setRoom(null)}
          themes={THEMES}
          currentBg={currentBg}
          onChangeTheme={setCurrentBg}
        />
      )}
    </div>
  );
}

export default App;
