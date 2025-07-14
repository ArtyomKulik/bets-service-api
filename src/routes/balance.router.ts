import { FastifyInstance } from 'fastify';
import { balanceSchema, IBalanceDto } from '../schemas/Balance';
import * as controllers from '../controllers';
import { validationUtils } from '../utils/validation.utils';

async function balanceRouter(fastify: FastifyInstance) {
  fastify.post<{ Body: IBalanceDto }>(
    '/',
    {
      schema: {
        description: 'Установка баланса пользователя',
      },
      preValidation: validationUtils.preValidation(balanceSchema),
    },
    controllers.setInitialBalance,
  );
}

export default balanceRouter;
