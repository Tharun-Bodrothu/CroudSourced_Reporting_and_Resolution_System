const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// CORS - allow client origin from env or localhost during development
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err));

// Routes
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/department", departmentRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("CiviX Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});
