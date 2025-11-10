import Joi from 'joi';

export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

// PATCH /users/update
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email().max(64),
  bio: Joi.string().max(500).allow('', null),
  socialLinks: Joi.object({
    twitter: Joi.string().uri().allow(''),
    facebook: Joi.string().uri().allow(''),
    instagram: Joi.string().uri().allow(''),
  }).optional(),
}).min(1);

// PATCH /users/avatar
export const updateAvatarBodySchema = Joi.object({
  avatar: Joi.string().uri().optional(),
}).unknown(false);
