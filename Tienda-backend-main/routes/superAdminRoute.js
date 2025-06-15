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
    
    if (!term || term.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Search term is required." 
      });
    }

    // Search for admins that match the search term and are not approved (pending)
    const searchResults = await AdminUser.find({
      $and: [
        { isApproved: false }, // Only pending admins
        {
          $or: [
            { name: { $regex: term, $options: "i" } }, // Case-insensitive search
            { email: { $regex: term, $options: "i" } },
            { _id: { $regex: term, $options: "i" } },
            { phone: { $regex: term, $options: "i" } }
          ]
        }
      ]
    });

    res.status(200).json(searchResults);
  } catch (error) {
    console.error("Error searching pending admins:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while searching." 
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