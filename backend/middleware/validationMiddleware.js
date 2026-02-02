const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(100).required(),
  role: Joi.string().valid("author", "reader", "admin").default("author")
}).options({ abortEarly: true, allowUnknown: true });

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(100).required(),
}).options({ abortEarly: true, allowUnknown: true });

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required()
}).options({ abortEarly: true, allowUnknown: true });

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers'
  })
}).options({ abortEarly: true, allowUnknown: true });

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
    })
}).options({ abortEarly: true, allowUnknown: true });

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message, 
        field: error.details[0].path?.[0] || null,
      });
    }
    req.body = value; 
    next();
  };
}

module.exports = {
  signupValidation: validate(signupSchema),
  loginValidation: validate(loginSchema),
  sendOtpValidation: validate(sendOtpSchema),
  verifyOtpValidation: validate(verifyOtpSchema),
  resetPasswordValidation: validate(resetPasswordSchema),
};
