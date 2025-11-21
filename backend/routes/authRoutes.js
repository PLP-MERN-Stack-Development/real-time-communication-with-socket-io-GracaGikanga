const express  = require ("express");
const { registerUser, loginUser } = require ("../controller/authController.js");

const router = express.Router();

// 🚀 REGISTER USER
router.post("/register", registerUser);

// 🚀 LOGIN USER
router.post("/login", loginUser);

module.exports = router;

