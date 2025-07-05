import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import * as controllers from '../controllers';
import { checkValidRequest, checkValidUser } from '../helpers/auth.helper';
import { placeBetSchema } from '../schemas/Bet';

async function betRouter(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      config: {
        description:
          'Размещает ставку для аутентифицированного пользователя. Проверяет достаточность баланса.',
      },
      preValidation: utils.preValidation(placeBetSchema),
      preHandler: [checkValidRequest, checkValidUser],
    },
    controllers.placeBet,
  );

  fastify.get(
    '/',
    {
      config: {
        description: 'Получение истории ставок пользователя',
      },
      preHandler: [checkValidRequest, checkValidUser],
    },

    controllers.getBets,
  );

  fastify.get(
    '/:id',
    {
      config: {
        description: 'Получение одной ставки по id',
      },
      preHandler: [checkValidRequest, checkValidUser],
    },
    controllers.getBetById,
  );

  fastify.get(
    '/recommended',
    {
      config: {
        description: 'Получение рекомендуемой ставки',
      },
      preHandler: [checkValidRequest, checkValidUser],
    },
    controllers.getRecommendedBet,
  );
}

export default betRouter;
