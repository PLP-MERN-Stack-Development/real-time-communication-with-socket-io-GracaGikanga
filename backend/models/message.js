const mongoose = require ("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true
  },

  text: {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  read: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Message", messageSchema);
