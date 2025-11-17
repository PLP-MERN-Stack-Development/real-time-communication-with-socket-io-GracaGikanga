const express = require('express');
const ChatRoom = require('../models/chatRoom');
const authMiddleware = require ("../middleware/authMiddleware.js");
const router = express.Router();


//Get all chats for a user
router.get("/",authMiddleware, async (req, res) => {
  try {
    
    const userId = req.query.user._Id; // e.g. /api/chat?userId=123
    const rooms = await ChatRoom.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("messages");

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//GET BY ID or GET a single chat by Id
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate("participants", "name email")
      .populate("messages");

    if (!room) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    // 🚀 optional: ensure user is participant
    if (!room.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST - add a message to a chat
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: "messageId is required" });
    }

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { $push: { messages: messageId } },
      { new: true }
    );

    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST create a chat room
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { roomType, roomName, participants } = req.body;

    if (!roomType || !participants || participants.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // 🚀 Add current user automatically if not included
    if (!participants.includes(req.user._id.toString())) {
      participants.push(req.user._id);
    }

    // Prevent duplicate private chat
    if (roomType === "private" && participants.length === 2) {
      const existing = await ChatRoom.findOne({
        roomType: "private",
        participants: { $all: participants, $size: 2 },
      });
      if (existing) return res.json(existing);
    }

    const newRoom = await ChatRoom.create({
      roomType,
      roomName: roomType === "group" ? roomName : undefined,
      participants,
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//PUT -rename a group chat
router.put("/:roomId/rename", authMiddleware, async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: "newName is required" });

    const room = await ChatRoom.findById(req.params.roomId);

    // 🚀 check if user is participant
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    room.roomName = newName;
    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//PUT -add or remove participants of a group
router.put("/:roomId/participants", authMiddleware, async (req, res) => {
  try {
    const { userId, action } = req.body;
    if (!userId || !action) return res.status(400).json({ error: "userId and action are required" });

    const room = await ChatRoom.findById(req.params.roomId);

    // 🚀 check if user making request is participant
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    if (action === "add") {
      if (!room.participants.includes(userId)) room.participants.push(userId);
    } else if (action === "remove") {
      room.participants = room.participants.filter(p => p.toString() !== userId);
    } else {
      return res.status(400).json({ error: "action must be add or remove" });
    }

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//DELETE a chat room
router.delete("/:roomId", authMiddleware, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    // 🚀 check if user is participant
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({ error: "You are not a participant" });
    }

    await ChatRoom.findByIdAndDelete(req.params.roomId);
    res.json({ message: "Chat room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;