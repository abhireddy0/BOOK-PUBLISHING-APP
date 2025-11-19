const express = require("express");
const router = express.Router();

const {signup,login,logOut,sendOtp,verifyOtp,resetPassword} = require('../controllers/authController')
const { signupValidation, loginValidation } = require("../middleware/validationMiddleware");

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/logout", logOut);
router.post("/sendotp", sendOtp);
router.post("/verifyotp", verifyOtp);
router.post("/resetpassword", resetPassword);

module.exports = router;
