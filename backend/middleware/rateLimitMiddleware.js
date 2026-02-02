const rateLimit = require('express-rate-limit');

// Email-based key generator for OTP rate limiting
const otpKeyGenerator = (req) => {
  const email = req.body?.email?.toLowerCase().trim();
  return email || req.ip; // fallback to IP if email missing
};

// Email-based rate limit for OTP sending (max 5 per 15 minutes per email)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // increased from 3
  keyGenerator: otpKeyGenerator,
  skipSuccessfulRequests: true, // only count failed requests
  message: {
    message: 'Too many OTP requests for this email. Please try again in 15 minutes.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limit for OTP verification (max 5 attempts per 15 minutes)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many verification attempts. Please request a new OTP.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard rate limit for password reset (max 3 per hour)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: 'Too many password reset attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
};
