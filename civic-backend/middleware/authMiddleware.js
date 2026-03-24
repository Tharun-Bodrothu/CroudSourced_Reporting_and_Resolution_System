const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.warn(`Auth: No token provided for ${req.originalUrl}`);
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId).populate("department", "name");
    if (!user || user.isActive === false) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    // Normalize shape for all controllers/routes
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      role: user.role,
      departmentId: user.department?._id?.toString() || null,
      departmentName: user.department?.name || null,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn(`Auth: Token expired for ${req.originalUrl}`);
      return res.status(401).json({ message: "Token expired" });
    }
    console.warn(`Auth: Invalid token for ${req.originalUrl}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
