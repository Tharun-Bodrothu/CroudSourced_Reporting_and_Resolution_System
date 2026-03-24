// fixDepartments2.js — run with: node fixDepartments2.js
const mongoose = require("mongoose");
const Issue = require("./models/Issue");
const Department = require("./models/Department");
require("dotenv").config();

// Map keywords in title/issueType/issueCategory → department name
const KEYWORD_MAP = [
  { keywords: ["pothole","road","bridge","footpath","speed breaker","road damage","road marking"], dept: "Roads" },
  { keywords: ["garbage","sanitation","drain","sewage","toilet","waste","cleaning"], dept: "Sanitation" },
  { keywords: ["electricity","electric","streetlight","street light","light","wire","power","transformer"], dept: "Electricity" },
  { keywords: ["water","leakage","pipe","supply","contaminated","pressure"], dept: "Water Supply" },
  { keywords: ["traffic","signal","parking","divider","sign board"], dept: "Traffic" },
  { keywords: ["environment","pollution","tree","park","stagnant","noise"], dept: "Environment" },
];

function guessDept(issue) {
  const text = [
    issue.title || "",
    issue.issueType || "",
    issue.issueCategory || "",
    issue.descriptionText || "",
  ].join(" ").toLowerCase();

  for (const { keywords, dept } of KEYWORD_MAP) {
    if (keywords.some(k => text.includes(k))) return dept;
  }
  return "Sanitation"; // default fallback
}

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  const depts = await Department.find();
  const deptMap = {};
  depts.forEach(d => { deptMap[d.name] = d._id; });
  console.log("Departments loaded:", Object.keys(deptMap).join(", "));

  // Get ALL issues where department is missing/null/undefined
  const issues = await Issue.find({
    $or: [
      { department: { $exists: false } },
      { department: null },
      { department: undefined },
    ]
  });

  console.log(`\nFound ${issues.length} issues to fix\n`);

  let fixed = 0;
  for (const issue of issues) {
    const deptName = guessDept(issue);
    const deptId = deptMap[deptName];
    if (deptId) {
      await Issue.updateOne(
        { _id: issue._id },
        { $set: { department: deptId } }
      );
      fixed++;
      console.log(`  ✅ "${issue.title || 'Untitled'}" → ${deptName}`);
    }
  }

  console.log(`\n✅ Done — fixed ${fixed} issues`);
  await mongoose.disconnect();
}

fix().catch(console.error);