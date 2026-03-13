const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
    type: {
      type: String,
      enum: [
        "complaint_submitted",
        "status_updated",
        "issue_resolved",
        "new_comment",
      ],
      required: true,
    },
    title: String,
    message: String,
    isRead: { type: Boolean, default: false },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

