const User = require("../models/userModel");
const sendMail = require("../config/sendMails");
const bcrypt = require("bcryptjs");
const genToken = require("../config/token");


const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email Already Registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword,
      role: role === "author" ? "author" : "reader",
    });

    
    const token = genToken(newUser._id, newUser.role);

    return res.status(201).json({
      message: "Signup Successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid email or password" });


    if (typeof user.password !== "string" || !user.password.startsWith("$2")) {
      return res.status(400).json({ message: "Account password not set correctly. Please reset your password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = genToken(user._id, user.role);

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error", error);
    return res.status(500).json({ message: "Server Error During Login" });
  }
};







const logOut = async (_req, res) => {
  try {
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error: ${error.message}` });
  }
};


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    // Try to send email with specific error handling
    try {
      await sendMail(user.email, otp);
      console.log(`[OTP] Successfully sent to ${user.email}`);
      return res.status(200).json({
        message: "OTP sent successfully. Please check your email."
      });
    } catch (emailError) {
      console.error(`[OTP] Email send failed for ${user.email}:`, emailError.message);

      // Handle timeout errors
      if (emailError.message.includes('timeout') || emailError.message.includes('timed out')) {
        return res.status(503).json({
          message: "Email service temporarily unavailable. Please try again in a moment.",
          retryable: true
        });
      }

      // Handle authentication errors (Gmail App Password issues)
      if (emailError.message.includes('535') || emailError.message.includes('authentication')) {
        console.error('[OTP] Email authentication failed - check EMAIL_PASS env variable');
        return res.status(500).json({
          message: "Email service configuration error. Please contact support.",
          retryable: false
        });
      }

      // Generic email error
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        retryable: true
      });
    }
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      message: "Server error during OTP generation. Please try again.",
      retryable: true
    });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.resetOtp !== String(otp) || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: `Verify OTP error: ${error.message}` });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await bcrypt.hash(String(password), 10);
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: `Reset password error: ${error.message}` });
  }
};

module.exports = { signup, login, logOut, verifyOtp, resetPassword, sendOtp };
