// fixFinal.js — run with: node fixFinal.js
const mongoose = require("mongoose");
require("dotenv").config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;

  // Load departments
  const depts = await db.collection("departments").find({}).toArray();
  const nameToId = {};
  depts.forEach(d => { nameToId[d.name.toLowerCase().trim()] = d._id; });
  console.log("Departments:", Object.keys(nameToId).join(", "));

  // String → department name mapping (covers all variations found in DB)
  const STRING_MAP = {
    "roads": "roads",
    "road": "roads",
    "public works": "roads",        // "Public Works" → Roads
    "infrastructure": "roads",
    "sanitation": "sanitation",
    "garbage": "sanitation",
    "waste": "sanitation",
    "uncategorised": "sanitation",  // fallback
    "general": "sanitation",
    "electricity": "electricity",
    "streetlight": "electricity",
    "water supply": "water supply",
    "water": "water supply",
    "traffic": "traffic",
    "environment": "environment",
  };

  // Get all issues where department is a string (not an ObjectId object)
  const allIssues = await db.collection("issues").find({}).toArray();
  const toFix = allIssues.filter(i =>
    typeof i.department === "string"
  );

  console.log(`\nFound ${toFix.length} issues with string department\n`);

  let fixed = 0;
  let failed = 0;

  for (const issue of toFix) {
    const raw = (issue.department || "").toLowerCase().trim();

    // Direct name match
    let deptId = nameToId[raw];

    // Try string map
    if (!deptId) {
      const mapped = STRING_MAP[raw];
      if (mapped) deptId = nameToId[mapped];
    }

    // Try partial match
    if (!deptId) {
      for (const [key, id] of Object.entries(nameToId)) {
        if (raw.includes(key) || key.includes(raw)) { deptId = id; break; }
      }
    }

    // Fallback to Sanitation
    if (!deptId) deptId = nameToId["sanitation"];

    if (deptId) {
      await db.collection("issues").updateOne(
        { _id: issue._id },
        { $set: { department: deptId } }
      );
      fixed++;
      console.log(`  ✅ "${issue.title || 'Untitled'}" | "${issue.department}" → ObjectId`);
    } else {
      failed++;
      console.log(`  ❌ Could not fix: "${issue.title}" | "${issue.department}"`);
    }
  }

  console.log(`\n✅ Fixed: ${fixed} | ❌ Failed: ${failed}`);
  await mongoose.disconnect();
}

fix().catch(console.error);