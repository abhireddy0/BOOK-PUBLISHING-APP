
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { getAuthorStats } = require("../controllers/dashboardController");


router.get("/author", auth, getAuthorStats);

module.exports = router;
