const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, trim: true, lowercase: true, unique: true },

    password: { type: String, required: true, minlength: 6 },

    role: { type: String, enum: ["reader", "author", "admin"], default: "reader" },

    avatar: { type: String, default: null },

    bio: { type: String, trim: true, maxlength: 300, default: "" },

    resetOtp: { type: String, default: null },

    otpExpires: { type: Date, default: null },

    isOtpVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
