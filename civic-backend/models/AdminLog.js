const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: [
        "CREATE_DEPARTMENT",
        "UPDATE_DEPARTMENT",
        "DEACTIVATE_DEPARTMENT",
        "ASSIGN_DEPARTMENT_ADMIN",
        "UPDATE_ISSUE_STATUS",
        "BAN_USER",
        "UNBAN_USER",
      ],
      required: true,
    },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    targetIssue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
    details: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);

