import Joi from 'joi';

export const createStorySchema = Joi.object({
  title: Joi.string().max(77).required(),
  description: Joi.string().max(2500).required(),
  category: Joi.string().required(),
});

export const updateStorySchema = Joi.object({
  title: Joi.string().max(78),
  description: Joi.string().max(2500),
  category: Joi.string(),
}).min(1);
