const Issue = require("../models/Issue");
const Comment = require("../models/Comment");
const IssueStatusHistory = require("../models/IssueStatusHistory");
const Notification = require("../models/Notification");
const { analyzeIssue } = require("../services/aiService");
const mongoose = require("mongoose");
const Department = require("../models/Department");

// Simple deterministic routing fallback: map categories/types to departments
const CATEGORY_TO_DEPARTMENT = {
  // Roads
  Pothole: "Roads",
  "Road Damage": "Roads",
  Infrastructure: "Roads",

  // Sanitation
  Garbage: "Sanitation",
  Waste: "Sanitation",

  // Electricity
  Streetlight: "Electricity",

  // Water Supply
  "Water Leakage": "Water Supply",
  Maintenance: "Water Supply",

  // Traffic
  Traffic: "Traffic",
  "Signal Issue": "Traffic",

  // Environment
  Pollution: "Environment",
  Trees: "Environment"
};

function mapCategoryToDepartment(issueCategory, issueType) {
  if (issueType && CATEGORY_TO_DEPARTMENT[issueType]) return CATEGORY_TO_DEPARTMENT[issueType];
  if (issueCategory && CATEGORY_TO_DEPARTMENT[issueCategory]) return CATEGORY_TO_DEPARTMENT[issueCategory];
  return "Sanitation";
}

/* =====================================================
   CREATE ISSUE
===================================================== */


exports.createIssue = async (req, res) => {
  try {
    // Defensive: ensure req.user exists
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Accept both JSON and multipart/form-data
    let descriptionText = req.body.descriptionText || "";
    let area = req.body["location[area]"] || req.body.area || "";
    let address = req.body["location[address]"] || req.body.address || "";
    let lat = req.body["location[coordinates][lat]"] || req.body.lat;
    let lng = req.body["location[coordinates][lng]"] || req.body.lng;

    // If JSON, try to parse nested location
    if (!area && req.body.location && typeof req.body.location === "object") {
      area = req.body.location.area || "";
      address = req.body.location.address || "";
      if (req.body.location.coordinates) {
        lat = req.body.location.coordinates.lat;
        lng = req.body.location.coordinates.lng;
      }
    }

    // Validate required field
    if (!descriptionText) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Rebuild location object
    const location = {
      area,
      address,
      city: "Visakhapatnam",
      coordinates: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
      },
    };

    // Handle uploaded photo (multer)
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // AI classification (safe fallback)
    let aiData = {};
    try {
      aiData = await analyzeIssue(descriptionText);
    } catch (err) {
      console.error("AI failed:", err.message);
      aiData = {
        title: "Civic Issue",
        issueCategory: "General",
        issueType: "General",
        department: "Public Works",
        severity: "low",
        priorityScore: 1,
      };
    }

    const departmentName = mapCategoryToDepartment(
      aiData.issueCategory,
      aiData.issueType
    );
    
    // Find department in DB
    const departmentDoc = await Department.findOne({ name: departmentName });
    
    if (!departmentDoc) {
      return res.status(400).json({ message: "Department not found" });
    }

    // Create Issue
    const newIssue = await Issue.create({
      title: aiData.title,
      descriptionText,
      issueCategory: aiData.issueCategory,
      issueType: aiData.issueType,
      department: departmentDoc._id,
      severity: aiData.severity,
      priorityScore: aiData.priorityScore,
      aiSummary: aiData.aiSummary,
      image,
      location,
      reportedBy: req.user.userId,
      originalReporter: req.user.userId,
      status: "reported",
    });

    // Notification: complaint submitted
    await Notification.create({
      user: req.user.userId,
      issue: newIssue._id,
      type: "complaint_submitted",
      title: "Complaint submitted",
      message: "Your civic issue has been submitted successfully.",
    });

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue,
    });
  } catch (error) {
    console.error("createIssue error:", error);
    res.status(500).json({ message: "Failed to report issue", error: error.message });
  }
};

/* =====================================================
   GET ALL ISSUES
===================================================== */
exports.getAllIssues = async (req, res) => {
  try {
    console.log("USER:", req.user);
    const query = {};

    if (req.user?.role === "department_admin" && req.user.departmentId) {
      query.department = req.user.departmentId;
    }

    const issues = await Issue.find(query)
    .populate("department", "name")   // 🔥 ADD THIS
    .populate("reportedBy", "name email")
    .populate("upvotes", "name");

    res.status(200).json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET MY ISSUES (CITIZEN)
===================================================== */
exports.getMyIssues = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const issues = await Issue.find({ reportedBy: userId })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET ISSUE BY ID
===================================================== */
exports.getIssueById = async (req, res) => {
  try {
    const issueId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(issueId)
      .populate("reportedBy", "name email")
      .populate("upvotes", "name");

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Department admins can only view their department issues
    if (req.user?.role === "department_admin" && req.user.department) {
      if (issue.department.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json({ data: issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   UPDATE ISSUE STATUS
===================================================== */
// controllers/issueController.js — replace updateIssueStatus

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // ✅ Department admin: ownership + status whitelist
    if (req.user.role === "department_admin") {
      if (issue.department.toString() !== req.user.departmentId) {
        return res.status(403).json({ message: "Access denied: not your department's issue" });
      }
      const allowed = ["acknowledged", "in_progress"];
      if (!allowed.includes(status)) {
        return res.status(403).json({ message: `Dept admin can only set: ${allowed.join(", ")}` });
      }
    }

    const previousStatus = issue.status;
    issue.status = status;
    if (status === "resolved") issue.resolvedAt = new Date();
    await issue.save();

    await IssueStatusHistory.create({
      issueId: issue._id,
      previousStatus,
      newStatus: status,
      updatedBy: req.user.id,
      remarks: "Status updated",
    });

    await Notification.create({
      user: issue.reportedBy,
      issue: issue._id,
      type: status === "resolved" ? "issue_resolved" : "status_updated",
      title: status === "resolved" ? "Issue resolved" : "Status updated",
      message: `Issue status changed from ${previousStatus} to ${status}.`,
      meta: { previousStatus, newStatus: status },
    });

    res.status(200).json({ message: "Issue status updated", issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/* =====================================================
   ANALYTICS
===================================================== */
exports.getAnalytics = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const highPriority = await Issue.countDocuments({ severity: "high" });
    const mediumPriority = await Issue.countDocuments({ severity: "medium" });
    const lowPriority = await Issue.countDocuments({ severity: "low" });

    const reported = await Issue.countDocuments({ status: "reported" });
    const acknowledged = await Issue.countDocuments({ status: "acknowledged" });
    const inProgress = await Issue.countDocuments({ status: "in_progress" });
    const resolved = await Issue.countDocuments({ status: "resolved" });
    const rejected = await Issue.countDocuments({ status: "rejected" });

    res.status(200).json({
      data: {
        totalIssues,
        highPriority,
        mediumPriority,
        lowPriority,
        reported,
        acknowledged,
        inProgress,
        resolved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   PRIORITY RANKING
===================================================== */
exports.getPriorityRanking = async (req, res) => {
  try {
    const query = {};

    if (req.user?.role === "department_admin" && req.user.departmentId) {
      query.department = req.user.departmentId;
    }

    const issues = await Issue.find(query)
      .sort({ priorityScore: -1, upvoteCount: -1 })
      .limit(50);

    res.status(200).json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   TOGGLE UPVOTE
===================================================== */
exports.toggleUpvote = async (req, res) => {
  try {
    const issueId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const userId = req.user.id;
    const already = issue.upvotes.some(
      (u) => u.toString() === userId
    );

    if (already) {
      issue.upvotes.pull(userId);
    } else {
      issue.upvotes.push(userId);
    }

    issue.upvoteCount = issue.upvotes.length;
    await issue.save();

    res.status(200).json({
      upvoteCount: issue.upvoteCount,
      upvoted: !already,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   COMMENTS
===================================================== */
exports.addComment = async (req, res) => {
  try {
    const issueId = req.params.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const comment = await Comment.create({
      issue: issue._id,
      user: req.user.id,
      text,
    });

    issue.commentCount = (issue.commentCount || 0) + 1;
    await issue.save();

    const populated = await Comment.findById(comment._id).populate(
      "user",
      "name"
    );

    // Notification: new comment to issue owner (if different user)
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id) {
      await Notification.create({
        user: issue.reportedBy,
        issue: issue._id,
        type: "new_comment",
        title: "New comment on your issue",
        message: text,
      });
    }

    res.status(201).json({ comment: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const issueId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const comments = await Comment.find({ issue: issueId })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   MAP ENDPOINT
===================================================== */
exports.getMapIssues = async (req, res) => {
  try {
    const query = {};

    if (req.user?.role === "department_admin" && req.user.departmentId) {
      query.department = req.user.departmentId;
    }

    const issues = await Issue.find(query).select(
      "title priorityScore location.coordinates"
    );

    res.status(200).json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   DEPARTMENT ISSUES
===================================================== */
exports.getDepartmentIssues = async (req, res) => {
  try {
    if (!req.user || !req.user.departmentId) {
      return res.status(403).json({ message: "Department not set for user" });
    }
    
    const issues = await Issue.find({
      department: req.user.departmentId,
    })
    .populate("department", "name")   // 🔥 ADD THIS
    .populate("reportedBy", "name");

    res.status(200).json({ data: issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const departmentStats = await Issue.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    res.status(200).json(departmentStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAreaAnalytics = async (req, res) => {
  try {
    const areaStats = await Issue.aggregate([
      { $group: { _id: "$location.area", count: { $sum: 1 } } }
    ]);
    res.status(200).json(areaStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

