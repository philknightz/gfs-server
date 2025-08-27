import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email is invalid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email is invalid",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
