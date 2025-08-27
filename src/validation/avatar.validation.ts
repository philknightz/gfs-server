import Joi from "joi";

export const avatarSchema = Joi.object({
  pid: Joi.string().required().max(100).messages({
    "any.required": "pid (Model ID) is required",
    "string.base": "pid (Model ID) must be string",
    "string.max": "pid no longer than 100 characters",
  }),
  prompt: Joi.string().required().max(1000).messages({
    "any.required": "prompt (Prompt text) is required",
    "string.base": "prompt (prompt text must be string)",
    "string.max": "prompt no longer than 1000 characters",
  }),
});
