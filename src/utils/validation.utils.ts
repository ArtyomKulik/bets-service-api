import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';

export const validationUtils = {
  validateSchema: (schema: Joi.ObjectSchema) => {
    return (data: any) => {
      const { error } = schema.validate(data);
      if (error) {
        throw new Error(error.details[0].message);
      }
    };
  },

  preValidation: (schema: Joi.ObjectSchema) => {
    return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
      const { error } = schema.validate(request.body);
      if (error) {
        return done(error);
      }
      done();
    };
  },
};
