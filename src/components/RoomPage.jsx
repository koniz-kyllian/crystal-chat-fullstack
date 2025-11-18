// src/components/RoomPage.jsx
import React, { useState, useEffect } from "react";

const RoomPage = ({ socket, username, onJoinRoom }) => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Lắng nghe phản hồi từ server
  useEffect(() => {
    socket.on("room_success", (room) => {
      onJoinRoom(room); // Chuyển sang trang Chat
    });

    socket.on("room_error", (msg) => {
      setError(msg); // Hiện lỗi
    });

    return () => {
      socket.off("room_success");
      socket.off("room_error");
    };
  }, [socket, onJoinRoom]);

  const handleAction = (action) => {
    if (!roomId || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    // Gửi yêu cầu lên server
    socket.emit("join_room", { roomId, password, action });
  };

  return (
    <div className="glass-card" style={{ maxWidth: "400px", width: "90%" }}>
      <h2 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>Chat Room</h2>
      <p style={{ marginBottom: "20px", opacity: 0.7 }}>
        Hi, <b>{username}</b>! Join or Create a room.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Room ID (e.g., room1)"
          className="glass-input"
          style={{ marginBottom: 0 }}
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
            setError("");
          }}
        />

        <input
          type="password"
          placeholder="Room Password"
          className="glass-input"
          style={{ marginBottom: 0 }}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
      </div>

      {error && (
        <div
          style={{
            color: "#ff6b6b",
            marginTop: "10px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.2)",
            padding: "5px",
            borderRadius: "5px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button className="glass-button" onClick={() => handleAction("join")}>
          Join Room
        </button>
        <button
          className="glass-button"
          onClick={() => handleAction("create")}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          Create New
        </button>
      </div>
    </div>
  );
};

export default RoomPage;
