import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';

async function transactionRouter(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        description: 'Получение истории транзакций',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string', pattern: '^\\d+$' },
            limit: { type: 'string', pattern: '^\\d+$' },
          },
        },
      },
    },

    controllers.getTransactions,
  );
}

export default transactionRouter;
