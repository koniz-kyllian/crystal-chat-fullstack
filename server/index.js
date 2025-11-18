const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

// --- 1. KẾT NỐI MONGODB ---
// Chuỗi kết nối của bạn
const MONGO_URI =
  "mongodb+srv://kylliankoniz_db_user:khanh123456@cluster0.4grch86.mongodb.net/?appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- 2. SCHEMAS ---

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Room = mongoose.model("Room", roomSchema);

const messageSchema = new mongoose.Schema({
  roomId: String,
  text: String,
  image: String,
  type: String,
  senderId: String,
  author: String,
  time: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// --- 3. API ---
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- 4. JOIN ROOM ---
  socket.on("join_room", async ({ roomId, password, action }) => {
    try {
      const room = await Room.findOne({ roomId });

      if (action === "create") {
        if (room) {
          socket.emit("room_error", "Phòng đã tồn tại, vui lòng chọn ID khác!");
        } else {
          const newRoom = new Room({ roomId, password });
          await newRoom.save();
          socket.join(roomId);
          socket.emit("room_success", roomId);
        }
      } else {
        if (!room) {
          socket.emit("room_error", "Phòng không tồn tại!");
        } else if (room.password !== password) {
          socket.emit("room_error", "Sai mật khẩu phòng!");
        } else {
          socket.join(roomId);
          socket.emit("room_success", roomId);
        }
      }
    } catch (err) {
      console.error(err);
      socket.emit("room_error", "Lỗi server!");
    }
  });

  // --- 5. LEAVE ROOM (PHẦN QUAN TRỌNG MỚI THÊM) ---
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId); // Ngắt kết nối socket khỏi phòng
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // --- 6. SEND MESSAGE ---
  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();
      io.to(data.roomId).emit("receive_message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // --- 7. TYPING ---
  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("display_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
