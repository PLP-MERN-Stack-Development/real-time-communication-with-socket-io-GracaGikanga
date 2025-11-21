const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


dotenv.config();
const connectDB = require("../config/db");
connectDB();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you are sending cookies
  })
);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/user", require("../routes/userRoutes"));
app.use("/api/chat", require("../routes/chatRoutes"));
app.use("/api/message", require("../routes/messageRoutes"));
app.use("/api/auth", require("../routes/authRoutes"));

// Socket.IO
const { initSocket } = require("./socket");
const io = initSocket(server);

// attach io to req for REST routes if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
