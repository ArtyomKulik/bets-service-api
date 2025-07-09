import { FastifyInstance } from 'fastify';
import { balanceSchema } from '../schemas/Balance';
import * as controllers from '../controllers';
import { validationUtils } from '../utils/validation.utils';

async function balanceRouter(fastify: FastifyInstance) {
  fastify.post(
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
