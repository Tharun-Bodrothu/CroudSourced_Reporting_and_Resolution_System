const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.warn(`Auth: No token provided for ${req.originalUrl}`);
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
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
