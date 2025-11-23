
const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { initiateCheckout, verifyPayment } = require("../controllers/PC");

router.post("/checkout/:bookId", auth, initiateCheckout);
router.post("/verify", auth, verifyPayment);

module.exports = router;
