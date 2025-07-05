import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { loginSchema } from '../schemas/Auth';
import * as controllers from '../controllers';

async function userRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            username: { type: 'string' },
          },
        },
        headers: {
          type: 'object',
          required: ['x-signature', 'user-id'],
          properties: {
            'x-signature': { type: 'string' },
            'user-id': { type: 'string' },
          },
        },
      },
      config: {
        description:
          'User login endpoint with JWT token response with required x-signature and user-id headers',
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
        utils.preValidation(loginSchema),
      ],
    },
    controllers.login,
  );
}

export default userRouter;
