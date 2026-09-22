const joi = require('joi');

exports.registerValidator = (req, res, next) => {
    const registerSchema = joi.object({
        fullName: joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.base": "Full name must be a string.",
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 3 characters long.",
      "string.max": "Full name cannot exceed 100 characters.",
      "any.required": "Full name is required.",
    }),

  email: joi.string()
    .trim()
    .email()
    .lowercase()
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
      "any.required": "Email is required.",
    }),

  phoneNumber: joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Phone number must be a string.",
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "any.required": "Phone number is required.",
    }),

  password: joi.string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,30}$/
    )
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password cannot exceed 30 characters.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "any.required": "Password is required.",
    }),
})
const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

exports.loginValidator = async (req, res, next) => {
  const schema = joi.object({
    emailOrPhoneNumber: joi.string().trim().required().messages({
      "string.empty": "Empty or PhoneNumber cannot be Empty",
      "any required": "Email or Phone Number is required",
    }),
    password: joi.string().required().messages({
      "any required": "Password is required",
      "string.empty": "Password cannot be Empty",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};