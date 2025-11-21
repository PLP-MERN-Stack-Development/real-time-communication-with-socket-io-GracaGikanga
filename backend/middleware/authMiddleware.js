const jwt = require ("jsonwebtoken");
const User = require ("../models/User.js");

// 🚀 Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  let token;

  // ✅ Check if Authorization header exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // ✅ Extract token
      token = req.headers.authorization.split(" ")[1];

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user to request object (without password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // allow access
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


module.exports = authMiddleware;

