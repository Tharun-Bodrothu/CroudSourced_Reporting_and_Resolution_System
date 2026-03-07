const mongoose = require("mongoose");

const issueStatusHistorySchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
  previousStatus: String,
  newStatus: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  remarks: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IssueStatusHistory", issueStatusHistorySchema);
