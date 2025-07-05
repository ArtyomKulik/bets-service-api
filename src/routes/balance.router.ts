import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import { balanceSchema } from '../schemas/Balance';
import * as controllers from '../controllers';
import { checkValidRequest, checkValidUser } from '../helpers/auth.helper';

async function balanceRouter(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      config: {
        description: 'Установка баланса пользователя',
      },
      preValidation: utils.preValidation(balanceSchema),
      preHandler: [checkValidRequest, checkValidUser],
    },
    controllers.setInitialBalance,
  );
}

export default balanceRouter;
