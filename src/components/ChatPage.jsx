// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

const ChatPage = ({
  socket,
  username,
  room,
  onLeaveRoom,
  themes,
  onChangeTheme,
  currentBg,
}) => {
  // --- STATES ---
  const [showSidebar, setShowSidebar] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");

  // State cho Media
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- AUTO SCROLL ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  // --- LOGIC SOCKET & API ---
  useEffect(() => {
    // 1. Lấy lịch sử tin nhắn CỦA PHÒNG HIỆN TẠI
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/messages/${room}`);
        const history = await res.json();
        setMessages(history);
      } catch (err) {
        console.log("Error fetching history:", err);
      }
    };
    fetchHistory();

    // 2. Lắng nghe tin nhắn mới
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
      setTypingStatus("");
    };

    // 3. Lắng nghe trạng thái "Đang gõ..."
    let typingTimer;
    const handleDisplayTyping = (data) => {
      setTypingStatus(`${data.username} is typing...`);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => setTypingStatus(""), 3000);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("display_typing", handleDisplayTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("display_typing", handleDisplayTyping);
      clearTimeout(typingTimer);
    };
  }, [socket, room]);

  // --- HÀM XỬ LÝ THOÁT PHÒNG ---
  const handleLeaveRoom = () => {
    // 1. Báo server ngắt kết nối khỏi phòng này
    socket.emit("leave_room", room);
    // 2. Reset state ở App.jsx để quay lại màn hình chọn phòng
    onLeaveRoom();
  };

  // --- GỬI TIN NHẮN ---
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const messageData = {
      roomId: room, // Gửi kèm ID phòng
      text: input,
      type: "text",
      senderId: socket.id,
      author: username,
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    };

    await socket.emit("send_message", messageData);
    setInput("");
    setShowEmojiPicker(false);
  };

  // --- GỬI ẢNH ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      const messageData = {
        roomId: room,
        image: base64Image,
        type: "image",
        senderId: socket.id,
        author: username,
        time: new Date().getHours() + ":" + new Date().getMinutes(),
      };
      socket.emit("send_message", messageData);
    };
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim() !== "") {
      socket.emit("typing", { username: username, roomId: room });
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className={`sidebar ${showSidebar ? "open" : ""}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>Menu</h3>
          <button className="close-btn" onClick={() => setShowSidebar(false)}>
            ×
          </button>
        </div>

        <div className="friend-item active">
          <img
            src={`https://ui-avatars.com/api/?name=${username}&background=random`}
            className="avatar"
            alt="Me"
          />
          {username} (You)
        </div>

        {/* Hiển thị thông tin phòng hiện tại */}
        <div className="friend-item">
          <img
            src="https://i.pravatar.cc/150?u=room"
            className="avatar"
            alt="Room"
          />
          Room: {room}
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            className="glass-button"
            onClick={() => setShowThemeModal(true)}
          >
            🎨 Change Theme
          </button>

          {/* NÚT THOÁT PHÒNG */}
          <button
            className="glass-button"
            onClick={handleLeaveRoom}
            style={{
              background: "rgba(255, 50, 50, 0.2)",
              border: "1px solid rgba(255, 50, 50, 0.4)",
              color: "#ffcccc",
            }}
          >
            🚪 Leave Room
          </button>
        </div>
      </div>

      {showSidebar && (
        <div className="overlay" onClick={() => setShowSidebar(false)}></div>
      )}

      {/* CHAT WINDOW */}
      <div className="chat-window">
        <div className="chat-header">
          <button className="menu-btn" onClick={() => setShowSidebar(true)}>
            ☰
          </button>
          <img
            src="https://i.pravatar.cc/150?u=bot_header"
            className="avatar avatar-small"
            alt="Header"
          />
          <span style={{ fontWeight: "bold" }}>Room: {room}</span>
        </div>

        <div className="messages-area">
          {messages.map((msg, index) => {
            const isMe = msg.author === username;
            return (
              <div
                key={index}
                className={`message-row ${isMe ? "sent" : "received"}`}
              >
                {!isMe && (
                  <span
                    className="message-author"
                    style={{
                      fontSize: "0.7rem",
                      position: "absolute",
                      top: "-18px",
                      left: "50px",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {msg.author}
                  </span>
                )}
                <img
                  src={`https://ui-avatars.com/api/?name=${msg.author}&background=random`}
                  className="avatar avatar-small"
                  alt="avatar"
                />
                <div
                  className={`chat-bubble ${isMe ? "sent" : "received"} ${
                    msg.type === "image" ? "no-padding" : ""
                  }`}
                >
                  {msg.type === "image" ? (
                    <img src={msg.image} alt="sent" className="message-image" />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })}
          {typingStatus && (
            <div
              style={{
                padding: "5px 20px",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.8)",
                fontStyle: "italic",
                marginLeft: "50px",
              }}
            >
              typing... {typingStatus} ✏️
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area-wrapper" style={{ position: "relative" }}>
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                theme="dark"
              />
            </div>
          )}
          <form className="input-area" onSubmit={sendMessage}>
            <button
              type="button"
              className="icon-btn"
              onClick={() => fileInputRef.current.click()}
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😃
            </button>
            <input
              type="text"
              className="glass-input"
              placeholder="Type a message..."
              style={{ margin: 0 }}
              value={input}
              onChange={handleTyping}
              onFocus={() => setShowEmojiPicker(false)}
            />
            <button
              className="glass-button"
              style={{
                width: "80px",
                margin: 0,
                background:
                  "linear-gradient(135deg, rgba(120, 200, 255, 0.6), rgba(60, 150, 255, 0.4))",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {showThemeModal && (
        <div
          className="theme-modal-overlay"
          onClick={() => setShowThemeModal(false)}
        >
          <div
            className="glass-card theme-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Choose Background</h3>
            <div className="theme-grid">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${
                    currentBg === theme.url ? "active" : ""
                  }`}
                  onClick={() => onChangeTheme(theme.url)}
                >
                  <img src={theme.url} alt={theme.name} />
                  <span>{theme.name}</span>
                </div>
              ))}
            </div>
            <button
              className="glass-button"
              onClick={() => setShowThemeModal(false)}
              style={{ marginTop: "20px", background: "rgba(255,0,0,0.3)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
