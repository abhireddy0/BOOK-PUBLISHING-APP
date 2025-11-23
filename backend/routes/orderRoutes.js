const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { getMyOrders, checkAccess } = require("../controllers/orderController");

router.get("/orders/my", auth, getMyOrders);

router.get("/orders/:bookId/access", auth, checkAccess);

module.exports = router;
