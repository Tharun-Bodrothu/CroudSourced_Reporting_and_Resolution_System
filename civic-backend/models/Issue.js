const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: String,
    descriptionText: String,
    descriptionVoiceUrl: String,
    images: [String],
    image: String,
    issueCategory: String,
    issueType: String,
    department: String,

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    priorityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    aiSummary: {
      type: String,
    },

    location: {
      area: String,
      ward: String,
      address: String,
      city: String,
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

  	reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originalReporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["reported", "acknowledged", "in_progress", "resolved", "rejected"],
      default: "reported",
    },

    assignedDepartment: String,
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedFieldStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    upvotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    upvoteCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    isDuplicate: { type: Boolean, default: false },
    parentIssueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },

    expectedResolutionDate: Date,
    resolvedAt: Date,

    beforeImage: String,
    afterImage: String,
  },
  { timestamps: true }
);

issueSchema.index({ issueType: 1, "location.area": 1 });
module.exports = mongoose.model("Issue", issueSchema);
