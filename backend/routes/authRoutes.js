const express  = require ("express")s;
const { registerUser, loginUser } = require ("../controllers/authController.js");

const router = express.Router();

// 🚀 REGISTER USER
router.post("/register", registerUser);

// 🚀 LOGIN USER
router.post("/login", loginUser);

export default router;
