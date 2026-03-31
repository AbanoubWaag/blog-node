require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "your_jwt_secret_key_here") {
  console.error("ERROR: Please Set A Real JWT_SECRET In Your .env File");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

connectDB();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  req.io = io;
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/posts",    require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/scrape",   require("./routes/scrape"));

io.on("connection", (socket) => {
  socket.on("join_post",  (postId) => socket.join(postId));
  socket.on("leave_post", (postId) => socket.leave(postId));
});

app.use((err, _req, res, _next) => {
  console.log(err);
  res.status(err.status || 500).json({ msg: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
