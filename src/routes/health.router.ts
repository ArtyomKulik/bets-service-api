import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';

async function healthRouter(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      config: {
        description: 'Проверка статуса API',
      },
    },

    controllers.checkHealth,
  );
}

export default healthRouter;
