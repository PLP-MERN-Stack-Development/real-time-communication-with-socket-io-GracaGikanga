const express = require ("express");
const Message = require ("../models/message.js");
const ChatRoom = require ("../models/chatRoom.js");
const authMiddleware = require ("../middleware/authMiddleware.js");

const router = express.Router();

// 🚀 GET all messages in a chat room
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;

    // ✅ Check if user is participant
    const room = await ChatRoom.findById(chatId);
    if (!room) return res.status(404).json({ error: "Chat room not found" });

    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "name email")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 POST a new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id; // 🚀 use JWT user

    if (!chatId || !text) {
      return res.status(400).json({ error: "chatId and text are required" });
    }

    // ✅ Ensure sender is participant
    const room = await ChatRoom.findById(chatId);
    if (!room.participants.some(p => p.equals(senderId))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    const newMessage = await Message.create({ senderId, chatId, text });

    // 🚀 Add message to ChatRoom
    await ChatRoom.findByIdAndUpdate(chatId, { $push: { messages: newMessage._id } });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 MARK MESSAGE AS READ
router.put("/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // ✅ Only participant of the chat can mark as read
    const room = await ChatRoom.findById(message.chatId);
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    message.read = true;
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 DELETE a message
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // ✅ Only sender can delete their message
    if (!message.senderId.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not allowed to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    // 🚀 Remove message from chat room
    await ChatRoom.findByIdAndUpdate(message.chatId, { $pull: { messages: message._id } });

    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
