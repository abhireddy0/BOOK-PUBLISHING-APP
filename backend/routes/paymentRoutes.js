const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  initiateCheckout,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/pay/checkout/:bookId", auth, initiateCheckout);

router.post("/pay/verify", auth, verifyPayment);

module.exports = router;
