import { FastifyInstance } from 'fastify';
import { loginSchema } from '../schemas/Auth';
import * as controllers from '../controllers';
import { validationUtils } from '../utils/validation.utils';

async function authRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      schema: {
        description: 'Логин',
        headers: {
          type: 'object',
          required: ['x-signature', 'user-id'],
          properties: {
            'x-signature': { type: 'string' },
            'user-id': { type: 'string' },
          },
        },
      },

      preValidation: [
        (request, reply, done) => {
          const { headers } = request;

          const userId = headers['user-id'];
          const clientSignature = headers['x-signature'];

          if (!userId || !clientSignature) {
            return reply.code(401).send({
              error: 'Missing user-id or signature header',
              message: 'Missing headers',
            });
          }

          done();
        },
        validationUtils.preValidation(loginSchema),
      ],
    },
    controllers.login,
  );
}

export default authRouter;
