const User =require ("../models/User.js");
const jwt = require ("jsonwebtoken");
const bcrypt = require ("bcryptjs");  // optional, but we already hash in schema

// 🚀 HELPER FUNCTION TO GENERATE JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d" // token valid for 7 days
  });
};

// 🚀 REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password // password is hashed automatically in schema
    });

    // ✅ Return user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🚀 L
