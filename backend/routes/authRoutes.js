const express = require("express");
const router = express.Router();

const {signup,login,logOut,sendOtp,verifyOtp,resetPassword} = require('../controllers/authController')
const {
  signupValidation,
  loginValidation,
  sendOtpValidation,
  verifyOtpValidation,
  resetPasswordValidation
} = require("../middleware/validationMiddleware");
const {
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter
} = require('../middleware/rateLimitMiddleware');

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/logout", logOut);
router.post("/sendotp", sendOtpValidation, otpSendLimiter, sendOtp);
router.post("/verifyotp", verifyOtpValidation, otpVerifyLimiter, verifyOtp);
router.post("/resetpassword", resetPasswordValidation, passwordResetLimiter, resetPassword);

module.exports = router;
