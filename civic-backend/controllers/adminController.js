const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");

exports.createDepartmentAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId } = req.body;
    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "department_admin",
      department: dept._id,
    });

    res.status(201).json({
      message: "Department admin created",
      data: { id: user._id, name: user.name, email: user.email, department: dept.name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setUserActive = async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: Boolean(isActive) },
      { new: true }
    ).select("name email role isActive");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

