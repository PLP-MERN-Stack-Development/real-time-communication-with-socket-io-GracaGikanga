// PrivateChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import axios from "axios";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

export default function PrivateChat({ user, recipient, token }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [reactionMenuId, setReactionMenuId] = useState(null);
  const [chatId, setChatId] = useState(null);

  const scrollRef = useRef();

  // ---------------------------------------------------------
  // 1. FETCH CHAT + JOIN SOCKET ROOM
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || !recipient || !token) return;

    const loadChat = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/message/private/${user._id}/${recipient._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const id = res.data.chatId || res.data._id;
        setChatId(id);

        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load private messages:", err);
      }
    };

    loadChat();
  }, [user, recipient, token]);

  // ---------------------------------------------------------
  // 2. SOCKET LISTENERS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinPrivate", { roomId: chatId });

    // ---- RECEIVE PRIVATE MESSAGE ----
    const handleIncoming = (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // ---- RECEIVE TYPING ----
    const handleTyping = ({ chatId: tChatId, userName }) => {
      if (tChatId !== chatId || userName === user.name) return;

      setTypingUsers((prev) => [...new Set([...prev, userName])]);

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((n) => n !== userName));
      }, 2000);
    };

    socket.on("newPrivateMessage", handleIncoming);
    socket.on("typingPrivate", handleTyping);

    return () => {
      socket.off("newPrivateMessage", handleIncoming);
      socket.off("typingPrivate", handleTyping);
    };
  }, [chatId, user.name]);

  // ---------------------------------------------------------
  // 3. SEND MESSAGE
  // ---------------------------------------------------------
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;
    if (!chatId) return;

    try {
      let messageToSend;

      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("text", newMessage);
        fd.append("chatId", chatId);

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/message/upload`,
          fd,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        messageToSend = res.data;
      } else {
        const msg = {
          senderId: user._id,
          receiverId: recipient._id,
          text: newMessage,
          chatId,
        };

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/message/private`,
          msg,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        messageToSend = res.data;
      }

      socket.emit("private_message", messageToSend);

      setMessages((prev) => [...prev, messageToSend]);
      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error("Message send failed:", err);
    }
  };

  // ---------------------------------------------------------
  // 4. HANDLE TYPING
  // ---------------------------------------------------------
  const handleTyping = () => {
    if (!chatId) return;
    socket.emit("typingPrivate", { chatId, userName: user.name });
  };

  // ---------------------------------------------------------
  // 5. REACTIONS
  // ---------------------------------------------------------
  const handleAddReaction = async (msgId, reaction) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/${msgId}/react`,
        { reaction },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? res.data : m))
      );

      setReactionMenuId(null);
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  };

  // ---------------------------------------------------------
  // 6. SCROLL TO BOTTOM
  // ---------------------------------------------------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="max-w-[760px] mx-auto p-4 border border-gray-300 rounded-md">
      <div className="h-[400px] overflow-y-auto mb-3 p-2 border border-gray-500 rounded-md bg-gray-800">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user._id;
          const lastReaction = msg.reactions?.at(-1)?.type;

          return (
            <div
              key={msg._id || i}
              className={`mb-2 flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <strong className="text-white">
                {isMe ? "You" : recipient.name}
              </strong>

              {msg.text && (
                <div
                  className={`inline-block max-w-[60%] px-3 py-1.5 rounded-md ${
                    isMe ? "bg-[#a8dadc]" : "bg-[#f1f1f1] text-black"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* File */}
              {msg.file && (
                <div className="mt-1">
                  {msg.file.mimetype?.startsWith("image/") ? (
                    <img
                      src={msg.file.url}
                      alt="attachment"
                      className="max-w-[200px] rounded-md"
                    />
                  ) : (
                    <a
                      href={msg.file.url}
                      target="_blank"
                      className="text-blue-400 underline"
                    >
                      {msg.file.filename}
                    </a>
                  )}
                </div>
              )}

              {/* Reactions */}
              {msg.reactions?.length > 0 && (
                <div className="flex gap-1 mt-1 text-sm text-white">
                  {msg.reactions.map((r, x) => (
                    <span key={x}>{r.type}</span>
                  ))}
                </div>
              )}

              {/* Reaction Button */}
              <div className="relative">
                <button
                  className="text-white text-xs mt-1 hover:text-yellow-400"
                  onClick={() =>
                    setReactionMenuId(reactionMenuId === msg._id ? null : msg._id)
                  }
                >
                  {lastReaction || "+"}
                </button>

                {reactionMenuId === msg._id && (
                  <div className="absolute bottom-6 left-0 flex gap-1 bg-gray-700 p-1 rounded-md">
                    {reactions.map((r) => (
                      <button
                        key={r}
                        className="text-lg"
                        onClick={() => handleAddReaction(msg._id, r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* Typing */}
      {typingUsers.length > 0 && (
        <div className="mb-3 text-sm text-gray-200">
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
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md bg-gray-700 text-white"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="bg-gray-700 text-white p-1 rounded-md"
        />

        <button className="px-4 py-2 bg-blue-600 rounded-md text-white">
          Send
        </button>
      </form>
    </div>
  );
}
