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
};
