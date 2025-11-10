import Joi from "joi";

export const createStorySchema = Joi.object({
    title: Joi.string().max(80).required(),
    description: Joi.string().max(2500).required(),
    category: Joi.string().required(),
});
