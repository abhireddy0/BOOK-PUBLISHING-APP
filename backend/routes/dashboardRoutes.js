// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const roles = require("../middleware/rolesMiddleware");
const {
  getAuthorStats,
  getAdminStats,
} = require("../controllers/dashboardController");

// Author dashboard
router.get("/author", auth, roles("author"), getAuthorStats);

// Admin dashboard
router.get("/admin", auth, roles("admin"), getAdminStats);

module.exports = router;
