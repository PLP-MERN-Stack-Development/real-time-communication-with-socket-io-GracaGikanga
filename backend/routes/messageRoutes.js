// backend/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/message"); // Your message model
const ChatRoom = require("../models/chatRoom"); // Optional if you track chats

// ------------------ GET PRIVATE MESSAGES ------------------
router.get("/private/:userId/:recipientId", authMiddleware, async (req, res) => {
  const { userId, recipientId } = req.params;

  try {
    // Find chat between the two users
    let chat = await ChatRoom.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!chat) {
      // Create chat if it doesn't exist
      chat = await ChatRoom.create({ participants: [userId, recipientId] });
    }

    // Fetch messages for this chat
    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 });
    res.json({ chatId: chat._id, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch private messages" });
  }
});

// ------------------ SEND PRIVATE MESSAGE ------------------
router.post("/private", authMiddleware, async (req, res) => {
  const { senderId, receiverId, text, chatId } = req.body;

  try {
    const newMessage = await Message.create({
      senderId,
      receiverId,
      chatId,
      text,
      timestamp: new Date(),
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ------------------ ADD REACTION ------------------
router.put("/:messageId/react", authMiddleware, async (req, res) => {
  const { messageId } = req.params;
  const { reaction } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    message.reactions = message.reactions || [];
    message.reactions.push({ type: reaction, user: req.user._id });
    await message.save();

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

module.exports = router;
