const User = require("../models/userModel");
const sendMail = require("../config/sendMails");
const bcrypt = require("bcryptjs");
const genToken = require("../config/token");

// POST /auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: "Email Already Registered" });

    const hashPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword,
      role: role === "author" ? "author" : "reader",
    });

    return res.status(201).json({
      message: "Signup Successful",
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

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // 🔴 IMPORTANT: include password (schema has select:false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) {
      return res.status(400).json({ message: "Account has no password set" });
    }

    const isMatch = await bcrypt.compare(String(password), String(user.password));
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

// POST /auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    await sendMail(user.email, otp);

    return res.status(200).json({ message: "OTP email sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: `Send OTP error: ${error.message}` });
  }
};

// POST /auth/verify-otp
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

// POST /auth/reset-password
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
