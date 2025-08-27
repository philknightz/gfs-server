import Joi from "joi";

export const modelSchema = Joi.object({
  model_name: Joi.string().required().max(100).messages({
    "any.required": "model_name is required",
    "string.base": "model_name must be a string",
    "string.max": "model_name no longer than 100 characters",
  }),
  type: Joi.string().required().valid("normal", "gen_50").messages({
    "any.required": "type is required",
    "string.base": 'type must be "normal" or "gen_50"',
  }),
  gender: Joi.string().required().valid("male", "female").messages({
    "any.required": "type is required",
    "string.base": 'gender must be "male or "female"',
  }),
});
