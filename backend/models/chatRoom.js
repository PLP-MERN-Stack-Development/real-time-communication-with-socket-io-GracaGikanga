const mongoose = require ("mongoose");
const chatRoomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: function () {
        return this.roomType === "group";
      },
    },

    roomType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
