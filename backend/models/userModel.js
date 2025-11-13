const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ['reader', 'author', 'admin'],
      default: 'reader'
    },

    avatar: {
      type: String
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300
    },

   
   
    resetOtp: {
      type: String
    },

    otpExpires: {
      type: Date
    },

    isOtpVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
