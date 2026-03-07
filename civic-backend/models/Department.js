const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
});

module.exports = mongoose.model("Department", departmentSchema);
