// routes/departmentRoutes.js — full replacement

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const Issue = require("../models/Issue");
const IssueStatusHistory = require("../models/IssueStatusHistory");
const Notification = require("../models/Notification");

// Statuses dept admin is allowed to set
const DEPT_ADMIN_ALLOWED_STATUSES = ["acknowledged", "in_progress"];

router.use(authMiddleware, roleMiddleware("department_admin"));

// GET /api/department/issues
router.get("/issues", async (req, res) => {
  try {
    if (!req.user.departmentId) {
      return res.status(403).json({ message: "Department not assigned to this admin" });
    }

    const issues = await Issue.find({ department: req.user.departmentId }) // ✅ ObjectId match
      .populate("department", "name")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/department/stats  ✅ NEW — department dashboard stats
router.get("/stats", async (req, res) => {
  try {
    if (!req.user.departmentId) {
      return res.status(403).json({ message: "Department not assigned to this admin" });
    }

    const deptFilter = { department: req.user.departmentId };

    const [total, reported, acknowledged, inProgress, resolved] = await Promise.all([
      Issue.countDocuments(deptFilter),
      Issue.countDocuments({ ...deptFilter, status: "reported" }),
      Issue.countDocuments({ ...deptFilter, status: "acknowledged" }),
      Issue.countDocuments({ ...deptFilter, status: "in_progress" }),
      Issue.countDocuments({ ...deptFilter, status: "resolved" }),
    ]);

    res.json({
      data: {
        departmentName: req.user.departmentName,
        total,
        reported,
        acknowledged,
        inProgress,
        resolved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/department/update-status
router.put("/update-status", upload.single("afterImage"), async (req, res) => {
  try {
    const { issueId, status } = req.body;

    // ✅ Whitelist: dept admin cannot set "resolved" or "reported"
    if (!DEPT_ADMIN_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({
        message: `Department admin can only set status to: ${DEPT_ADMIN_ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // ✅ Ownership check — only their department
    if (issue.department.toString() !== req.user.departmentId) {
      return res.status(403).json({ message: "Access denied: issue belongs to another department" });
    }

    const previousStatus = issue.status;
    issue.status = status;
    if (req.file) issue.afterImage = `/uploads/${req.file.filename}`;
    await issue.save();

    await IssueStatusHistory.create({
      issueId: issue._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.id,
      remarks: "Status updated by department admin",
    });

    await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: "status_updated",
      title: "Issue status updated",
      message: `Your issue status changed from ${previousStatus} to ${status}.`,
      meta: { previousStatus, newStatus: status },
    });

    res.json({ message: "Issue updated", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;