const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const AdminUserModel = require("../models/AdminuserModel");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined.");

// Utility function to calculate age
function calculateAge(birthDateStr) {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Get admin user by ID
exports.getAdminUserById = async (req, res) => {
  try {
    const adminUser = await AdminUserModel.getAdminUserById(req.params.id);
    if (!adminUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(adminUser);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create a new admin user
exports.createAdminUser = async (req, res) => {
  const { name, email, password, phone, address, gender, birthDate } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !gender ||
    !birthDate
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const age = calculateAge(birthDate);
  if (age < 18) {
    return res
      .status(400)
      .json({ message: "User must be at least 18 years old" });
  }

  try {
    const existingUser = await AdminUserModel.getAdminUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await AdminUserModel.createAdminUser(
      name,
      email,
      hashedPassword,
      phone,
      address,
      gender,
      birthDate
    );

    res.status(201).json({
      message: "Admin user registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ error: "Error creating admin user" });
  }
};

// Login admin user
exports.loginAdminUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const adminUser = await AdminUserModel.getAdminUserByEmail(email);
    if (!adminUser) {
      console.warn(`Login failed: Email not found - ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      console.warn(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Make sure you return Adminuser and token in the response
    res.status(200).json({
      success: true,
      token,
      Adminuser: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        address: adminUser.address,
        gender: adminUser.gender,
        birthDate: adminUser.birthDate,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
