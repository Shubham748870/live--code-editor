const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const ACTIONS = require("./src/Actions");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ================= SOCKET.IO (Realtime Sync) =================
const userSocketMap = {};
const roomCode = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return { socketId, username: userSocketMap[socketId] };
    }
  );
};

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    if (roomCode[roomId]) {
      socket.emit(ACTIONS.CODE_CHANGE, { code: roomCode[roomId] });
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    roomCode[roomId] = code;
    socket.broadcast.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      const username = userSocketMap[socket.id];
      const clients = getAllConnectedClients(roomId).filter(
        (c) => c.socketId !== socket.id
      );

      socket.broadcast.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username,
        clients,
      });
    });
    delete userSocketMap[socket.id];
  });
});

// ================= RUN CODE API =================
app.post("/run", async (req, res) => {
  const { language, code } = req.body;

  try {
    let filePath, cmd;

    if (language === "html" || language === "css") {
      // HTML/CSS ko sirf render karna hai
      return res.json({ output: code });
    } else if (language === "sql") {
      // Dummy SQL handling (yaha ek proper DB integrate kar sakte ho, abhi sirf echo kar raha hai)
      return res.json({ output: `📊 SQL Query Received:\n${code}` });
    } else if (language === "javascript") {
      filePath = path.join(__dirname, "temp.js");
      fs.writeFileSync(filePath, code);
      cmd = `node ${filePath}`;
    } else if (language === "python") {
      filePath = path.join(__dirname, "temp.py");
      fs.writeFileSync(filePath, code);
      cmd = `python3 ${filePath}`;
    } else if (language === "java") {
      filePath = path.join(__dirname, "Main.java");
      fs.writeFileSync(filePath, code);
      cmd = `javac Main.java && java Main`;
    } else {
      return res.status(400).json({ output: "❌ Language not supported" });
    }

    exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) return res.json({ output: stderr || error.message });
      res.json({ output: stdout });
    });
  } catch (err) {
    res.status(500).json({ output: "❌ Execution failed" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
