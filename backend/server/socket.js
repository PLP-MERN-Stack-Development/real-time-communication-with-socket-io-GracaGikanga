// backend/server/socket.js
let io;

const initSocket = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // GLOBAL CHAT
    socket.on("joinGlobal", () => {
      socket.join("global");
      console.log("Joined global room:", socket.id);
    });

    socket.on("sendGlobalMessage", (msg) => {
      io.to("global").emit("newGlobalMessage", msg); // broadcast to all
    });

    socket.on("global_typing", ({ name, isTyping }) => {
      socket.to("global").emit("globalTypingUsers", { name, isTyping });
    });

    // PRIVATE CHAT
    socket.on("joinPrivate", ({ userId, otherId }) => {
      const room = getPrivateRoom(userId, otherId);
      socket.join(room);
    });

    socket.on("sendPrivateMessage", ({ senderId, receiverId, text, file }) => {
      const room = getPrivateRoom(senderId, receiverId);
      io.to(room).emit("newPrivateMessage", { senderId, receiverId, text, file, _id: Date.now() });
    });

    socket.on("private_typing", ({ senderId, receiverId, name, isTyping }) => {
      const room = getPrivateRoom(senderId, receiverId);
      socket.to(room).emit("privateTypingUsers", { name, isTyping });
    });

    // REACTIONS
    socket.on("reaction", (payload) => {
      if (payload.receiverId) {
        const room = getPrivateRoom(payload.senderId, payload.receiverId);
        io.to(room).emit("reaction", payload);
      } else {
        io.to("global").emit("reaction", payload);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getPrivateRoom = (id1, id2) => {
  // Consistent room name regardless of sender/receiver
  return [id1, id2].sort().join("_");
};

module.exports = { initSocket };
