// frontend/src/hooks/useChat.js
import { useState, useEffect, useRef } from "react";
import { connectSocket, socket } from "../socket";

export default function useChat({ user, recipient = null, chatType, token }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [file, setFile] = useState(null);
  const scrollRef = useRef(null);

  // ---------------- CONNECT SOCKET ----------------
  useEffect(() => {
    if (!user) return;
    connectSocket(user);

    if (chatType === "global") socket.emit("joinGlobal");
    else if (recipient) socket.emit("joinPrivate", { userId: user._id, otherId: recipient._id });
  }, [user, chatType, recipient]);

  // ---------------- FETCH MESSAGES ----------------
  useEffect(() => {
    if (!user || !token) return;

    const fetchMessages = async () => {
      try {
        const url =
          chatType === "global"
            ? `${import.meta.env.VITE_BACKEND_URL}/api/message/global`
            : `${import.meta.env.VITE_BACKEND_URL}/api/message/private/${user._id}/${recipient._id}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [user, recipient, chatType, token]);

  // ---------------- SOCKET LISTENERS ----------------
  useEffect(() => {
    if (!user || !socket) return;

    const handleNewMessage = (msg) => {
      const relevant =
        chatType === "global" ||
        (msg.senderId?._id === recipient?._id && msg.receiverId?._id === user._id) ||
        (msg.senderId?._id === user._id && msg.receiverId?._id === recipient?._id);

      // Avoid duplicates: check if message already exists
      if (relevant && !messages.some((m) => m._id === msg._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ name, isTyping }) => {
      if (name === user.name) return;
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(name)) return [...prev, name];
        if (!isTyping) return prev.filter((n) => n !== name);
        return prev;
      });
    };

    const handleReaction = ({ msgId, reaction }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === msgId ? { ...msg, reactions: [...(msg.reactions || []), reaction] } : msg
        )
      );
    };

    socket.on(chatType === "global" ? "newGlobalMessage" : "newPrivateMessage", handleNewMessage);
    socket.on(chatType === "global" ? "globalTypingUsers" : "privateTypingUsers", handleTyping);
    socket.on("reaction", handleReaction);

    return () => {
      socket.off(chatType === "global" ? "newGlobalMessage" : "newPrivateMessage", handleNewMessage);
      socket.off(chatType === "global" ? "globalTypingUsers" : "privateTypingUsers", handleTyping);
      socket.off("reaction", handleReaction);
    };
  }, [user, recipient, chatType, messages]); // added messages to deps for duplicate check

  // ---------------- SCROLL TO BOTTOM ----------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = (text) => {
    if (!text.trim() && !file) return;
    if (!socket.connected) return;

    const tempId = Date.now(); // temp ID for optimistic message
    const payload = {
      senderId: user._id,
      ...(chatType === "private" && { receiverId: recipient._id }),
      text,
      file,
    };

    // Emit message to server
    socket.emit(chatType === "global" ? "sendGlobalMessage" : "sendPrivateMessage", payload);

    // Optimistic update with temp ID
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        senderId: { _id: user._id, name: user.name },
        receiverId: recipient,
        text,
        file,
        timestamp: new Date().toISOString(),
        reactions: [],
      },
    ]);

    setFile(null);
  };

  // ---------------- TYPING ----------------
  const handleTyping = (value) => {
    if (!socket.connected) return;
    socket.emit(chatType === "global" ? "global_typing" : "private_typing", {
      senderId: user._id,
      ...(chatType === "private" && { receiverId: recipient._id }),
      name: user.name,
      isTyping: value.length > 0,
    });
  };

  // ---------------- ADD REACTION ----------------
  const addReaction = (msgId, reaction) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === msgId ? { ...msg, reactions: [...(msg.reactions || []), reaction] } : msg
      )
    );

    socket.emit("reaction", {
      msgId,
      reaction,
      senderId: user._id,
      receiverId: recipient?._id || null,
    });
  };

  return { messages, typingUsers, sendMessage, handleTyping, scrollRef, file, setFile, addReaction };
}
