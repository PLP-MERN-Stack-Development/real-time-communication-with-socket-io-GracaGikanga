const mongoose = require ("mongoose");
const bcrypt = require ("bcryptjs");  

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  socketId: {
    type: String,
    default: null
  },

  online: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// 🚀 HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🚀 METHOD TO COMPARE PASSWORDS DURING LOGIN
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
