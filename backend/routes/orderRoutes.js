
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  checkAccess,
} = require("../controllers/orderController");


router.post("/orders/:bookId", auth, createOrder);


router.get("/orders/my", auth, getMyOrders);

router.get("/orders/:bookId/access", auth, checkAccess);

module.exports = router;
