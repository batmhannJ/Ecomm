const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const AdminUser = require("../models/adminUserModel");
const {
  signup,
  login,
  getAdminById,
  updateAdmin,
  getAdmins,
  searchAdmin,
} = require("../controllers/adminController");

// router.post('/signup', signup);
router.post("/login", login);
router.post("/signup", signup); 
router.get("/admin/:id", getAdminById);
router.patch("/editadmin/:id", updateAdmin);
router.get("/admins", getAdmins);
router.get("/api/admin/search", searchAdmin);

router.delete("/deleteadmin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await AdminUser.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/approved/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const seller = await AdminUser.findOne({ _id: id, isApproved: true });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found or not approved" });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error("Error fetching approved seller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the 'id' from the route parameters
    const deletedSeller = await AdminUser.findByIdAndDelete(id);

    if (!deletedSeller) {
      return res
        .status(404)
        .json({ success: false, errors: ["Admin not found"] });
    }

    res.json({ success: true, message: "Admin declined successfully." });
  } catch (err) {
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, errors: ["Server Error"] });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  console.log('Received request to send OTP to:', email);
  console.log('Generated OTP:', otp);
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }


    // Generate OTP (6 digits)
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
    const otp = generateOtp();
    console.log(`Generated OTP: ${otp}`);

    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5-minute expiry
  try {
    console.log('Setting up transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });
    console.log('Sending email...');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });
    console.log('Email sent successfully');
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
});
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const storedOtpData = otpStore[email];

  if (!storedOtpData) {
    return res.status(400).json({ success: false, message: 'No OTP found for this email' });
  }

  if (storedOtpData.otp === otp && storedOtpData.expiresAt > Date.now()) {
    // Clear OTP after successful verification
    delete otpStore[email];
    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
});



module.exports = router;
