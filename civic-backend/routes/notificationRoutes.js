const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

router.use(authMiddleware);

// GET /api/notifications - current user's notifications
router.get("/", async (req, res) => {
  try {
    const items = await Notification.find({ user: req.user.userId || req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/:id/read - mark as read
router.put("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId || req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ data: notif });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

