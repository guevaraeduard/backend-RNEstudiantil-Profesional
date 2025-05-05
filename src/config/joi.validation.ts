import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGODB: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});