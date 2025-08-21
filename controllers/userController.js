const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.createUser = async (req, res) => {
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

  try {
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser(
      name,
      email,
      hashedPassword,
      phone,
      address,
      gender,
      birthDate
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await UserModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        birthDate: user.birthDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, address, gender, birthDate } = req.body;

  if (!id) return res.status(400).json({ message: "User ID is required" });

  try {
    let updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (gender) updates.gender = gender;
    if (birthDate) updates.birthDate = birthDate;
    if (password) updates.password = await bcrypt.hash(password, 10);

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await UserModel.updateUser(id, updates);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
