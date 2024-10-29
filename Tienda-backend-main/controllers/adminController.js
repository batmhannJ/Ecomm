const express = require("express"); // Import express
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/adminUserModel");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

const router = express.Router(); // Create a new router

// Sign Up for Admin
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, errors: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new AdminUser({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ success: true, token });
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ success: false, errors: "An error occurred during signup" });
  }
};

// Login for Admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Get email and password from the request body
    const admin = await AdminUser.findOne({ email }); // Find the admin by email

    // Check if admin exists
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, errors: "Invalid email or password" });
    }

    // Check if the provided password matches the stored password (plain text comparison)
    if (password !== admin.password) {
      return res
        .status(400)
        .json({ success: false, errors: "Invalid email or password" });
    }

    // Generate a JWT token if login is successful
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log({ success: true, token, adminId: admin._id });
    res.json({ success: true, token, adminId: admin._id });
    // Send admin ID back to client
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, errors: "An error occurred during login" });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit admin route
const updateAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    // Create an object to hold the update fields
    const updateFields = { name, email, phone };

    // Only add password if it exists in the request body
    if (password) {
      updateFields.password = password; // Handle password hashing if needed
    }

    const updatedAdmin = await AdminUser.findByIdAndUpdate(
      req.params.id,
      updateFields, // Use the constructed object
      { new: true } // This option returns the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export the router and other functions
module.exports = {
  login,
  signup,
  getAdminById,
  updateAdmin, // Export the router so it can be used in the routes
};
