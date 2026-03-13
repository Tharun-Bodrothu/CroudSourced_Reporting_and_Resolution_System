const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const {
  createIssue,
  getAllIssues,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  getAnalytics,
  getDepartmentAnalytics,
  getAreaAnalytics,
  getPriorityRanking,
  toggleUpvote,
  addComment,
  getComments,
  getMapIssues,
  getDepartmentIssues,
} = require("../controllers/issueController");

/* =====================================================
   TEST ROUTE
===================================================== */
router.get("/test-route", (req, res) => {
  res.json({ message: "Issue route working" });
});

/* =====================================================
   CREATE ISSUE
===================================================== */
// router.post(
//   "/create",
//   authMiddleware,
//   [check("descriptionText").notEmpty().withMessage("Description is required")],
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty())
//       return res.status(400).json({ errors: errors.array() });
//     next();
//   },
//   createIssue
// );
router.post(
  "/create",
  authMiddleware,
  upload.single("photo"),
  createIssue
);
/* =====================================================
   ISSUE LISTING
===================================================== */
router.get("/all", authMiddleware, getAllIssues);
router.get("/mine", authMiddleware, getMyIssues);
router.get("/priority-ranking", authMiddleware, getPriorityRanking);
router.get("/:id", authMiddleware, getIssueById);

/* =====================================================
   ANALYTICS
===================================================== */
router.get("/analytics", authMiddleware, getAnalytics);
router.get(
  "/analytics/departments",
  authMiddleware,
  getDepartmentAnalytics
);
router.get("/analytics/areas", authMiddleware, getAreaAnalytics);

/* =====================================================
   MAP
===================================================== */
// Public temporary route (for debugging)
router.get("/map-public", getMapIssues);

// Protected map
router.get("/map", authMiddleware, getMapIssues);

/* =====================================================
   DEPARTMENT ISSUES
===================================================== */
router.get("/department", authMiddleware, getDepartmentIssues);

/* =====================================================
   UPVOTES
===================================================== */
router.post("/:id/upvote", authMiddleware, toggleUpvote);

/* =====================================================
   COMMENTS
===================================================== */
router.post(
  "/:id/comments",
  authMiddleware,
  [check("text").notEmpty().withMessage("Comment text required")],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  addComment
);

router.get("/:id/comments", authMiddleware, getComments);

/* =====================================================
   UPDATE STATUS (ADMIN ONLY)
===================================================== */
router.put(
  "/update-status/:issueId",
  authMiddleware,
  roleMiddleware("admin", "department_admin"),
  updateIssueStatus
);

module.exports = router;