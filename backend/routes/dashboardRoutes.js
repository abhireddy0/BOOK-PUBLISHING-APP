const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const roles = require("../middleware/rolesMiddleware");
const {
  getAuthorStats,
  getAdminStats,
} = require("../controllers/dashboardController");

router.get("/author", auth, roles("author"), getAuthorStats);

router.get("/admin", auth, roles("admin"), getAdminStats);

module.exports = router;
