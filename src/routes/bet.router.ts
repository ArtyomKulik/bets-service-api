import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { betResultSchema, placeBetSchema } from '../schemas/Bet';
import { validationUtils } from '../utils/validation.utils';

async function betRouter(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        description:
          'Размещает ставку для аутентифицированного пользователя. Проверяет достаточность баланса.',
      },
      preValidation: validationUtils.preValidation(placeBetSchema),
    },
    controllers.placeBet,
  );

  fastify.get(
    '/',
    {
      schema: {
        description: 'Получение истории ставок пользователя',
      },
    },

    controllers.getBets,
  );

  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Получение одной ставки по id',
      },
    },
    controllers.getBetById,
  );

  fastify.get(
    '/recommended',
    {
      schema: {
        description: 'Получение рекомендуемой ставки',
      },
    },
    controllers.getRecommendedBet,
  );

  fastify.post(
    '/win',
    {
      schema: {
        description:
          'Обрабатывает результат ставки. Вероятность выигрыша 50%. При выигрыше сумма удваивается.',
      },
      preValidation: validationUtils.preValidation(betResultSchema),
    },
    controllers.getBetResult,
  );
}

export default betRouter;
