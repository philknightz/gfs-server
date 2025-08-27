import Joi from "joi";

export const progressSchema = Joi.object({
  session_id: Joi.string().messages({
    "any.required": "session_id is required",
    "string.base": "session_id must be a string",
  }),
  image_id: Joi.string().messages({ "string.base": "image_id must be string" }),
  model_id: Joi.string().messages({
    "string.base": "model_id must be string",
  }),
});
