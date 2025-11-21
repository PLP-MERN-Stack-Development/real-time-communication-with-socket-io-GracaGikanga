import { useState, useEffect } from "react";
import { createPrivateChat } from "../api/api";
import socket from "../socket";

const Sidebar = ({ token, onlineUsers, setSelectedChat }) => {
  
  // -----------------------------
  // 1️⃣ Start or load a private chat
  // -----------------------------
  const startPrivateChat = async (userId) => {
    try {
      // Create or return existing chat between you & userId
      const chat = await createPrivateChat(token, userId);

      // Update UI
      setSelectedChat(chat);

      // Join the private room through socket.io
      socket.emit("join_room", chat._id);

    } catch (err) {
      console.error("Failed to start private chat:", err);
    }
  };

  return (
    <ul>
      {onlineUsers.map((u) => (
        <li
          key={u._id}
          onClick={() => startPrivateChat(u._id)}
          className="cursor-pointer hover:bg-gray-200 p-2 rounded"
        >
          {u.name} {u.online ? "🟢" : "⚪️"}
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
