const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    default: null
  },

  text: {
    type: String,
    required: true
  },
  file: {
    url: String,
    filename: String,
    mimetype: String
  },
   read: { 
    type: Boolean, 
    default: false },
  
   readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  timestamp: {
    type: Date,
    default: Date.now
  },
  
  reactions: {
  type: [String],
  default: [],
}

});

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
