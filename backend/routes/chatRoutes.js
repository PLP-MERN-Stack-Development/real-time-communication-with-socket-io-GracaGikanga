const express = require("express");
const ChatRoom = require("../models/chatRoom");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all chats for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await ChatRoom.find({ participants: userId })
      .populate("participants", "name email")
      .populate({
        path: "messages",
        populate: { path: "senderId", select: "name email" },
      });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single chat by ID
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate("participants", "name email")
      .populate({
        path: "messages",
        populate: { path: "senderId", select: "name email" },
      });

    if (!room) return res.status(404).json({ error: "Chat room not found" });

    if (!room.participants.some((p) => p._id.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or get private chat
router.post("/private", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body; // frontend should send { userId: recipientId }
    const myId = req.user._id;

    if (!userId) return res.status(400).json({ message: "userId required" });

    let chat = await ChatRoom.findOne({
      roomType: "private",
      participants: { $all: [myId, userId] },
    }).populate("participants", "name email");

    if (!chat) {
      chat = await ChatRoom.create({
        roomType: "private",
        participants: [myId, userId],
      });
      chat = await ChatRoom.findById(chat._id).populate(
        "participants",
        "name email"
      );
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
});

// Create group chat
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { roomType, roomName, participants } = req.body;
    if (!roomType || !participants || participants.length === 0)
      return res.status(400).json({ error: "Missing required fields" });

    if (!participants.includes(req.user._id.toString())) {
      participants.push(req.user._id);
    }

    const newRoom = await ChatRoom.create({
      roomType,
      roomName: roomType === "group" ? roomName : undefined,
      participants,
    });

    const populatedRoom = await ChatRoom.findById(newRoom._id).populate(
      "participants",
      "name email"
    );

    res.status(201).json(populatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
