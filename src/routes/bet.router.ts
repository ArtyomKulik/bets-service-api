import { FastifyInstance } from 'fastify';
import { utils } from '../utils';
import * as controllers from '../controllers';
import { betResultSchema, placeBetSchema } from '../schemas/Bet';

async function betRouter(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      config: {
        description:
          'Размещает ставку для аутентифицированного пользователя. Проверяет достаточность баланса.',
      },
      preValidation: utils.preValidation(placeBetSchema),
    },
    controllers.placeBet,
  );

  fastify.get(
    '/',
    {
      config: {
        description: 'Получение истории ставок пользователя',
      },
    },

    controllers.getBets,
  );

  fastify.get(
    '/:id',
    {
      config: {
        description: 'Получение одной ставки по id',
      },
    },
    controllers.getBetById,
  );

  fastify.get(
    '/recommended',
    {
      config: {
        description: 'Получение рекомендуемой ставки',
      },
    },
    controllers.getRecommendedBet,
  );

  fastify.post(
    '/win',
    {
      config: {
        description:
          'Обрабатывает результат ставки. Вероятность выигрыша 50%. При выигрыше сумма удваивается.',
      },
      preValidation: utils.preValidation(betResultSchema),
    },
    controllers.getBetResult,
  );
}

export default betRouter;
