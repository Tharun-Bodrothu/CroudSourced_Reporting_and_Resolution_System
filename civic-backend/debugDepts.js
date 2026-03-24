// debugDepts.js — run with: node debugDepts.js
const mongoose = require("mongoose");
const Issue = require("./models/Issue");
const Department = require("./models/Department");
require("dotenv").config();

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  const depts = await Department.find();
  console.log("=== DEPARTMENTS IN DB ===");
  depts.forEach(d => console.log(`  ${d._id} → "${d.name}"`));

  const issues = await Issue.find().limit(10);
  console.log("\n=== FIRST 10 ISSUES — department field ===");
  issues.forEach(i => {
    console.log(`  title: "${i.title}" | department: ${JSON.stringify(i.department)} | type: ${typeof i.department}`);
  });

  await mongoose.disconnect();
}

debug().catch(console.error);