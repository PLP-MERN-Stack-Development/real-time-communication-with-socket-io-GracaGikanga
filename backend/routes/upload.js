// routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Message = require("../models/message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// -------------------- Ensure uploads folder exists --------------------
const UPLOADS_FOLDER = "uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

// -------------------- Multer storage configuration --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// -------------------- Upload file route --------------------
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { chatId, text } = req.body;
      const senderId = req.user._id;

      // Validate
      if (!chatId && !text && !req.file) {
        return res
          .status(400)
          .json({ error: "Message text or file is required" });
      }

      // Create new message
      const newMessage = await Message.create({
        senderId,
        chatId: chatId || null, // null for global chat
        text: text || "",
        file: req.file
          ? {
              url: `/uploads/${req.file.filename}`,
              filename: req.file.originalname,
              mimetype: req.file.mimetype,
            }
          : undefined,
        readBy: [senderId],
      });

      res.status(201).json(newMessage);
    } catch (err) {
      console.error("File upload error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
