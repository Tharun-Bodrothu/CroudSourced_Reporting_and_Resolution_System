const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "department_admin", "field_staff"],
      default: "user",
    },

    // For department_admin / field_staff
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    language: { type: String, default: "English" },
    civicScore: { type: Number, default: 0 },

    location: {
      area: String,
      ward: String,
      city: String,
      state: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

