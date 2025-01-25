const express = require("express");
const router = express.Router();

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

module.exports = router;
