const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🚀 Helper: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token valid for 7 days
  });
};

// 🚀 REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // ✅ Create user (password hashed in schema)
    const user = await User.create({ name, email, password });

    // ✅ Respond with user, token, and success message
    res.status(201).json({
      success: true,
      message: "✅ Signup successful! Redirecting to login...",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🚀 LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Return standardized user object
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerUser, loginUser };
