import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().max(64).required(),
  password: Joi.string().min(8).max(33).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(64).required(),
  password: Joi.string().min(8).max(33).required(),
});
