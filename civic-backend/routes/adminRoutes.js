const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const Issue = require("../models/Issue");
const User = require("../models/User");
const Department = require("../models/Department");
const { createDepartmentAdmin, setUserActive } = require("../controllers/adminController");

// All admin routes require admin role
router.use(authMiddleware, roleMiddleware("admin"));

// GET /api/admin/issues - view all issues
router.get("/issues", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/assign-department - assign department to issue
router.put("/assign-department", async (req, res) => {
  try {
    const { issueId, departmentId } = req.body;
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const issue = await Issue.findByIdAndUpdate(
      issueId,
      {
        department: department.name,
        assignedDepartment: department._id,
      },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Department assigned", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/analytics - system-wide analytics
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalIssues = await Issue.countDocuments();

    const byStatus = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      data: {
        totalUsers,
        totalDepartments,
        totalIssues,
        byStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic department management
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
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json({ data: department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic user listing for manage users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role isActive");
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department admin (super admin)
router.post("/department-admins", createDepartmentAdmin);

// Activate / deactivate user
router.put("/users/active", setUserActive);

module.exports = router;

