import Joi from "joi";

export const createArticleSchema = Joi.object({
    storyImage: Joi.binary().max(2 * 1024 * 1024).required(),
    title: Joi.string().max(80).required(),
    description: Joi.string().max(2500).required(),
    category: Joi.string().required(),
});
