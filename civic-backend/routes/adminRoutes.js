const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const Issue = require("../models/Issue");
const User = require("../models/User");
const Department = require("../models/Department");
const IssueStatusHistory = require("../models/IssueStatusHistory");
const Notification = require("../models/Notification");
const { createDepartmentAdmin, setUserActive } = require("../controllers/adminController");

router.use(authMiddleware, roleMiddleware("admin"));

// ─── ISSUES ───────────────────────────────
router.get("/issues", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("department", "name")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 }); // ✅ newest first
    res.json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/issues/:issueId/status — admin final status update (including resolved)
router.put("/issues/:issueId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ["reported", "acknowledged", "in_progress", "resolved", "rejected"];
    if (!VALID.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const previousStatus = issue.status;
    issue.status = status;
    if (status === "resolved") issue.resolvedAt = new Date();
    await issue.save();

    await IssueStatusHistory.create({
      issueId: issue._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.id,
      remarks: "Status updated by admin",
    });

    await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: status === "resolved" ? "issue_resolved" : "status_updated",
      title: status === "resolved" ? "Issue resolved" : "Status updated",
      message: `Your issue status changed from ${previousStatus} to ${status}.`,
      meta: { previousStatus, newStatus: status },
    });

    res.json({ message: "Status updated", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/assign-department", async (req, res) => {
  try {
    const { issueId, departmentId } = req.body;
    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });
    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { department: department._id, assignedDepartment: department._id },
      { new: true }
    );
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Department assigned", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── ANALYTICS ────────────────────────────
router.get("/analytics", async (req, res) => {
  try {
    const [
      totalUsers, totalDepartments, totalIssues,
      reported, acknowledged, inProgress, resolved, rejected,
    ] = await Promise.all([
      User.countDocuments(),
      Department.countDocuments(),
      Issue.countDocuments(),
      Issue.countDocuments({ status: "reported" }),
      Issue.countDocuments({ status: "acknowledged" }),
      Issue.countDocuments({ status: "in_progress" }),
      Issue.countDocuments({ status: "resolved" }),
      Issue.countDocuments({ status: "rejected" }),
    ]);

    const byDepartment = await Issue.aggregate([
      { $group: {
        _id: "$department",
        total: { $sum: 1 },
        resolved:   { $sum: { $cond: [{ $eq: ["$status","resolved"] },   1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status","in_progress"] },1, 0] } },
        reported:   { $sum: { $cond: [{ $eq: ["$status","reported"] },   1, 0] } },
      }},
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" }},
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true }},
      { $project: { _id:0, departmentId:"$_id", departmentName:"$dept.name", total:1, resolved:1, inProgress:1, reported:1 }},
      { $sort: { total: -1 }},
    ]);

    res.json({
      data: { totalUsers, totalDepartments, totalIssues, reported, acknowledged, inProgress, resolved, rejected, byDepartment },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DEPARTMENTS ──────────────────────────
router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ data: departments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/departments", async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ data: department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/departments/:id", async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ data: department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── USERS ────────────────────────────────
// ✅ Now returns full user details including phone, createdAt, department name
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone role isActive department createdAt civicScore")
      .populate("department", "name")
      .sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/department-admins", createDepartmentAdmin);
router.put("/users/active", setUserActive);

module.exports = router;