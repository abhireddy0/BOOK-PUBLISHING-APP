// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  getMyOrders,
  checkAccess,
} = require("../controllers/orderController");

// all routes here require auth

// list all paid orders of current user
router.get("/orders/my", auth, getMyOrders);

// check if current user has access to a given book
router.get("/orders/:bookId/access", auth, checkAccess);

module.exports = router;
