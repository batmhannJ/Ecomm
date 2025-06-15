const express = require("express");
const router = express.Router();
const AdminUser = require("../models/adminUserModel");

const {
  approveAdmin,
  login,
  getsuperAdminById,
  updateSuperAdmin,
  getPendingAdmins,
} = require("../controllers/superAdminController");

// router.post('/signup', signup);
router.post("/login", login);
router.patch("/approve/:adminId", approveAdmin); // Add this line for approving admins
router.get("/superadmin/:id", getsuperAdminById);
router.patch("/editsuperadmin/:id", updateSuperAdmin);
router.get("/pending", getPendingAdmins);

// Search route for pending admins
router.get("/search", async (req, res) => {
  try {
    const { term } = req.query;
    
    console.log("Search term received:", term); // Debug log
    
    if (!term || term.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search term is required."
      });
    }

    // Create search conditions for string fields only
    let searchConditions = [
      { email: { $regex: term, $options: "i" } }
    ];

    // Add name search if name field exists
    if (term) {
      searchConditions.push({ name: { $regex: term, $options: "i" } });
    }

    // Add phone search if phone field exists
    if (term) {
      searchConditions.push({ phone: { $regex: term, $options: "i" } });
    }

    // For _id search, only search if it's a valid ObjectId format
    if (term.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid ObjectId, search for exact match
      searchConditions.push({ _id: term });
    }
    // Remove the regex search on _id as it's not supported

    console.log("Search conditions:", searchConditions); // Debug log

    // Search for admins that match the search term and are not approved (pending)
    const searchResults = await AdminUser.find({
      $and: [
        { isApproved: false }, // Only pending admins
        { $or: searchConditions }
      ]
    });

    console.log("Search results found:", searchResults.length); // Debug log
    res.status(200).json(searchResults);
    
  } catch (error) {
    console.error("Error searching pending admins:", error);
    console.error("Error details:", error.message); // More detailed error log
    res.status(500).json({
      success: false,
      message: "Server error while searching.",
      error: error.message // Include error details for debugging
    });
  }
});

router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the seller by ID and update 'isApproved' to true
    const updatedSeller = await AdminUser.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true } // Return the updated document
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found." });
    }

    res.status(200).json({ success: true, seller: updatedSeller });
  } catch (error) {
    console.error("Error approving admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;