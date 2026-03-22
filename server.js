const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ─── Serve frontend ───
app.use(express.static(path.join(__dirname, "public")));

// ─── Persistent data (simple JSON file) ───
const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (e) {}
  return { history: [], currentUrl: "", currentTitle: "", isPlaying: false };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let state = loadData();
let onlineUsers = new Set();

// ─── Socket.io ───
io.on("connection", (socket) => {
  const username = socket.handshake.query.username || "Anonymous";
  onlineUsers.add(username);

  console.log(`${username} connected (${onlineUsers.size} online)`);

  // Send current state to new user
  socket.emit("sync-state", {
    ...state,
    onlineUsers: Array.from(onlineUsers),
  });

  // Broadcast updated user list
  io.emit("users-update", Array.from(onlineUsers));

  // ─── Video sync events ───
  socket.on("load-video", ({ url, title }) => {
    state.currentUrl = url;
    state.currentTitle = title;
    state.isPlaying = true;
    saveData(state);
    socket.broadcast.emit("video-loaded", { url, title });
  });

  socket.on("play", () => {
    state.isPlaying = true;
    socket.broadcast.emit("play");
  });

  socket.on("pause", () => {
    state.isPlaying = false;
    socket.broadcast.emit("pause");
  });

  socket.on("seek", (time) => {
    socket.broadcast.emit("seek", time);
  });

  // ─── Chat ───
  socket.on("chat-message", (msg) => {
    const message = {
      id: Date.now(),
      user: username,
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    io.emit("chat-message", message);
  });

  // ─── Emoji reactions ───
  socket.on("emoji", (emoji) => {
    io.emit("emoji", { emoji, user: username });
  });

  // ─── Ratings & History ───
  socket.on("rate-film", ({ title, url, rating }) => {
    const existing = state.history.find((h) => h.title === title);
    if (existing) {
      existing.ratedBy[username] = rating;
      existing.rating = Math.round(
        Object.values(existing.ratedBy).reduce((a, b) => a + b, 0) /
          Object.values(existing.ratedBy).length
      );
    } else {
      state.history.unshift({
        id: Date.now(),
        title,
        url,
        rating,
        ratedBy: { [username]: rating },
        date: new Date().toISOString().split("T")[0],
        favorite: false,
      });
    }
    state.currentUrl = "";
    state.currentTitle = "";
    state.isPlaying = false;
    saveData(state);
    io.emit("history-update", state.history);
    io.emit("video-stopped");
  });

  socket.on("toggle-favorite", (filmId) => {
    const film = state.history.find((h) => h.id === filmId);
    if (film) {
      film.favorite = !film.favorite;
      saveData(state);
      io.emit("history-update", state.history);
    }
  });

  socket.on("stop-video", () => {
    state.currentUrl = "";
    state.currentTitle = "";
    state.isPlaying = false;
    saveData(state);
    io.emit("video-stopped");
  });

  // ─── Disconnect ───
  socket.on("disconnect", () => {
    onlineUsers.delete(username);
    console.log(`${username} disconnected (${onlineUsers.size} online)`);
    io.emit("users-update", Array.from(onlineUsers));
  });
});

// ─── API route to get history ───
app.get("/api/history", (req, res) => {
  res.json(state.history);
});

// ─── Start ───
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  WatchTogether is running!\n`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Share this URL with your partner\n`);
});
