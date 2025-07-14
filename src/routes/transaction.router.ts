import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

async function transactionRouter(fastify: FastifyInstance) {
  const handler = controllers.getTransactions(transactionService);

  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
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

    handler,
  );
}

export default transactionRouter;
