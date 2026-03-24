// checkRaw.js — run with: node checkRaw.js
const mongoose = require("mongoose");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  // Query the raw collection directly — bypasses Mongoose schema
  const db = mongoose.connection.db;
  const issues = await db.collection("issues").find({}).limit(15).toArray();

  console.log("=== RAW department values ===");
  issues.forEach(i => {
    console.log(`  title: "${i.title}" | department: ${JSON.stringify(i.department)} | _id: ${i._id}`);
  });

  // Count by department value type
  const all = await db.collection("issues").find({}).toArray();
  const types = {};
  all.forEach(i => {
    const t = i.department === undefined ? "undefined"
      : i.department === null ? "null"
      : typeof i.department === "object" ? "ObjectId"
      : `string:"${i.department}"`;
    types[t] = (types[t] || 0) + 1;
  });

  console.log("\n=== department field breakdown ===");
  Object.entries(types).forEach(([t, count]) => console.log(`  ${t}: ${count} issues`));

  await mongoose.disconnect();
}

check().catch(console.error);