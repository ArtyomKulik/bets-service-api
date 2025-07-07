import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { balanceSchema } from '../schemas/Balance';
import * as controllers from '../controllers';

async function balanceRouter(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        description: 'Установка баланса пользователя',
      }, 
      preValidation: utils.preValidation(balanceSchema),
    },
    controllers.setInitialBalance,
  );
}

export default balanceRouter;
