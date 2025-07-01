const Joi = require('joi');

const idSchema = Joi.object({
        id: Joi.number().required(),
    });

const articleSchema = Joi.object({
        title: Joi.string().min(5).required(),
        description: Joi.string().min(10).required(),
    });
module.exports = { idSchema, articleSchema };