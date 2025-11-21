// Rewritten GlobalChat.jsx (clean, stable, fully working)
import React, { useState, useEffect } from "react";
import { socket, connectSocket } from "../socket";
import useChat from "../hooks/useChat";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

export default function GlobalChat({ user, token, onSelectUser }) {
  const [newMessage, setNewMessage] = useState("");
  const [reactionMenuId, setReactionMenuId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const {
    messages,
    typingUsers,
    sendMessage,
    handleTyping,
    scrollRef,
    file,
    setFile,
    addReaction,
  } = useChat({ user, chatType: "global", token });

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    if (!user) return;

    connectSocket(user);
    socket.emit("user_join", { _id: user._id, name: user.name });

    socket.on("user_list", (users) => {
      setOnlineUsers(users.filter((u) => u._id !== user._id));
    });

    socket.on("user_alert", ({ text }) => addAlert(text));

    return () => {
      socket.off("user_list");
      socket.off("user_alert");
    };
  }, [user]);

  // ---------------- ALERTS ----------------
  const addAlert = (text) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, text }]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 3000);
  };

  // ---------------- SEND MESSAGE ----------------
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    sendMessage(newMessage);
    setNewMessage("");
    setFile(null);
  };

  // ---------------- REACTIONS ----------------
  const handleAddReaction = (msgId, reaction) => {
    addReaction(msgId, reaction);
    setReactionMenuId(null);
  };

  return (
    <div className="max-w-[760px] mx-auto p-4 relative">
      <h2 className="text-white font-bold mb-4">🌍 Global Chat</h2>

      {/* Alerts */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-yellow-400 text-black px-4 py-2 rounded shadow-md">
            {alert.text}
          </div>
        ))}
      </div>

      {/* Online Users */}
      <div className="mb-2 max-h-40 overflow-y-auto flex flex-col gap-2 p-2 bg-gray-900 rounded-md">
        {onlineUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => {
              onSelectUser?.(u);
              setNewMessage(`@${u.name} `);
            }}
            className="cursor-pointer bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto border border-gray-300 rounded-md p-2.5 mb-2 bg-gray-800 relative">
        {Array.isArray(messages) &&
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user._id;
            const lastReaction = msg.reactions?.[msg.reactions.length - 1] || null;

            return (
              <div key={msg._id} className={`mb-2.5 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <strong className="text-white">{isMe ? "You" : msg.senderId?.name}</strong>

                {msg.text && (
                  <div
                    className={`inline-block max-w-[60%] px-3 py-1.5 rounded-md ${
                      isMe ? "bg-[#a8dadc]" : "bg-[#f1f1f1] text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {msg.file && (
                  <div className="mt-1">
                    {msg.file.mimetype?.startsWith("image/") ? (
                      <img src={msg.file.url} alt={msg.file.filename} className="max-w-[200px] rounded-md" />
                    ) : (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {msg.file.filename}
                      </a>
                    )}
                  </div>
                )}

                {msg.reactions?.length > 0 && (
                  <div className="flex gap-1 mt-1 text-sm text-white">
                    {msg.reactions.map((r, idx) => (
                      <span key={idx}>{r}</span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <button
                    className="text-white text-xs mt-1 hover:text-yellow-400"
                    onClick={() => setReactionMenuId(reactionMenuId === msg._id ? null : msg._id)}
                  >
                    {lastReaction || "+"}
                  </button>

                  {reactionMenuId === msg._id && (
                    <div className="absolute bottom-6 left-0 flex gap-1 bg-gray-700 p-1 rounded-md">
                      {reactions.map((r) => (
                        <button key={r} className="text-lg" onClick={() => handleAddReaction(msg._id, r)}>
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</div>
              </div>
            );
          })}
        <div ref={scrollRef} />
      </div>

      {/* Typing */}
      {typingUsers.length > 0 && (
        <div className="min-h-[20px] mb-3 text-sm text-gray-200">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping(e.target.value);
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="bg-gray-700 text-white p-1 rounded-md" />
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}
