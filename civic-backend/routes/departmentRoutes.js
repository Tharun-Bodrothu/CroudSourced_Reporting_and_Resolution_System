const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const Issue = require("../models/Issue");

// Department admin only
router.use(authMiddleware, roleMiddleware("department_admin"));

// GET /api/department/issues - issues for this department
router.get("/issues", async (req, res) => {
  try {
    if (!req.user || !req.user.department) {
      return res
        .status(403)
        .json({ message: "Department not set for this user" });
    }

    const issues = await Issue.find({
      department: req.user.department,
    }).sort({ createdAt: -1 });

    res.json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/department/update-status - update status + optional proof image
router.put(
  "/update-status",
  upload.single("afterImage"),
  async (req, res) => {
    try {
      const { issueId, status } = req.body;
      const update = { status };

      if (req.file) {
        update.afterImage = `/uploads/${req.file.filename}`;
      }

      const issue = await Issue.findByIdAndUpdate(issueId, update, {
        new: true,
      });

      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      res.json({ message: "Issue updated", issue });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;

