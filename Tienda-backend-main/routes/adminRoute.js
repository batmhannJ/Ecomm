const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getAdminById,
  updateAdmin,
} = require("../controllers/adminController");

// router.post('/signup', signup);
router.post("/login", login);
router.get("/admin/:id", getAdminById);
router.patch("/editadmin/:id", updateAdmin);

module.exports = router;
