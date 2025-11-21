// frontend/src/socket.js
import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  if (!socket && user) {
    socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      auth: { userId: user._id },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("Connected to socket server:", socket.id));
  }

  return socket;
};

export { socket };
