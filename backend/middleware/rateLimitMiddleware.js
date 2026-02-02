const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// Email-based key generator (IPv6-safe fallback)
const otpKeyGenerator = (req) => {
  const email = req.body?.email?.toLowerCase().trim();

  // Prefer email-based limiting
  if (email) return email;

  // Safe fallback for IPv4 + IPv6 + proxies
  return ipKeyGenerator(req);
};

// OTP send limiter (5 OTPs per 15 minutes per email/IP)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: otpKeyGenerator,
  skipSuccessfulRequests: true,
  message: {
    message:
      "Too many OTP requests for this email. Please try again in 15 minutes.",
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify limiter (5 attempts per 15 minutes per IP)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many verification attempts. Please request a new OTP.",
  },
});

// Password reset limiter (3 per hour per IP)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many password reset attempts. Please try again later.",
  },
});

module.exports = {
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
};
