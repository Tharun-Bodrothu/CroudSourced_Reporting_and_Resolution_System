// fixDepartments.js
// Run once with: node fixDepartments.js
// Place this file in your backend root folder (same level as server.js)

const mongoose = require("mongoose");
const Issue = require("./models/Issue");
const Department = require("./models/Department");
require("dotenv").config();

async function fixDepartments() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Load all departments into a name → _id map
  const departments = await Department.find();
  const deptMap = {};
  departments.forEach(d => {
    deptMap[d.name.toLowerCase().trim()] = d._id;
  });

  console.log("📋 Departments found:", Object.keys(deptMap));

  // Find all issues where department is NOT a valid ObjectId
  // (i.e. it's either a string name or null/undefined)
  const issues = await Issue.find();
  let fixed = 0;
  let skipped = 0;
  let notFound = 0;

  for (const issue of issues) {
    const dept = issue.department;

    // Already a valid ObjectId that resolves — skip
    if (dept && mongoose.Types.ObjectId.isValid(dept)) {
      // Verify it actually exists in departments collection
      const exists = departments.find(d => d._id.toString() === dept.toString());
      if (exists) { skipped++; continue; }
    }

    // It's a string department name — try to match
    let deptName = null;
    if (typeof dept === "string") {
      deptName = dept.toLowerCase().trim();
    } else if (issue.assignedDepartment && typeof issue.assignedDepartment === "string") {
      deptName = issue.assignedDepartment.toLowerCase().trim();
    }

    // Also check issueCategory / issueType as fallback
    const fallbackMap = {
      "roads": "roads",
      "road": "roads",
      "pothole": "roads",
      "road damage": "roads",
      "infrastructure": "roads",
      "sanitation": "sanitation",
      "garbage": "sanitation",
      "waste": "sanitation",
      "electricity": "electricity",
      "streetlight": "electricity",
      "street light": "electricity",
      "water supply": "water supply",
      "water": "water supply",
      "water leakage": "water supply",
      "maintenance": "water supply",
      "traffic": "traffic",
      "signal": "traffic",
      "environment": "environment",
      "pollution": "environment",
      "trees": "environment",
    };

    // Try direct name match first
    let matchedId = deptMap[deptName];

    // Try fallback map
    if (!matchedId && deptName) {
      const fallback = fallbackMap[deptName];
      if (fallback) matchedId = deptMap[fallback];
    }

    // Try issueCategory / issueType
    if (!matchedId) {
      const cat = (issue.issueCategory || "").toLowerCase().trim();
      const type = (issue.issueType || "").toLowerCase().trim();
      matchedId = deptMap[fallbackMap[type]] || deptMap[fallbackMap[cat]];
    }

    if (matchedId) {
      issue.department = matchedId;
      await issue.save();
      fixed++;
      console.log(`  ✅ Fixed: "${issue.title || 'Untitled'}" → ${deptName || 'via category'}`);
    } else {
      // Default to Sanitation if nothing matches
      const defaultDept = deptMap["sanitation"];
      if (defaultDept) {
        issue.department = defaultDept;
        await issue.save();
        fixed++;
        console.log(`  ⚠️  Defaulted to Sanitation: "${issue.title || 'Untitled'}"`);
      } else {
        notFound++;
        console.log(`  ❌ Could not fix: "${issue.title || 'Untitled'}" (dept: ${dept})`);
      }
    }
  }

  console.log("\n── Migration complete ──");
  console.log(`✅ Fixed:   ${fixed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${notFound}`);

  await mongoose.disconnect();
  process.exit(0);
}

fixDepartments().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});