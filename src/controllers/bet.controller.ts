import { FastifyReply, FastifyRequest } from 'fastify';
import { IPlaceBetDto } from '../schemas/Bet';
import { prisma } from '../utils';

export const placeBet = async (
  request: FastifyRequest<{
    Body: IPlaceBetDto;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'];
  if (!id) {
    throw new Error('Ошибка авторизации');
  }
  const { bet } = request.body || {};
  if (!bet) throw new Error('Неверная сумма ставки');

  try {
    const placeBetResult = await prisma.$transaction(async (prisma) => {
      //  Используем findFirst с FOR UPDATE для блокировки
      const userBalance = await prisma.user_Balances.findFirst({
        where: { user_id: id },
        select: { balance: true },
      });

      //  Блокируем запись через специальный метод Prisma
      await prisma.$executeRaw`SELECT 1 FROM user_balances WHERE user_id = ${id} FOR UPDATE`;

      if (!userBalance) {
        throw new Error('Баланс пользователя не найден');
      }

      // Проверяем достаточность средств
      if (userBalance.balance.lessThan(bet)) {
        throw new Error('Недостаточно средств на балансе');
      }

      const newBet = await prisma.bet.create({
        data: {
          user_id: id,
          amount: bet,
          status: 'pending',
          win_amount: bet * 2,
        },
      });

      // Обновляем баланс пользователя
      await prisma.user_Balances.update({
        where: { user_id: id },
        data: { balance: { decrement: bet } },
      });

      return { bet_id: newBet.id, message: 'Bet placed successfully' };
    });

    reply.send(placeBetResult);
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
};

export const getBets = async (request, reply: FastifyReply) => {
  const { id } = request['authUser'] || {};
  if (!id) {
    reply.status(401).send({ error: 'Пользователь не аутентифицирован' });
  }
  try {
    const getBets = await prisma.bet.findMany();
    reply.send(getBets);
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
};

export const getBetById = async (
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'] || {};
  if (!id) {
    reply.status(401).send({ error: 'Пользователь не аутентифицирован' });
  }
  const betId = parseInt(request.params.id, 10);
  // Проверка валидности betId
  if (isNaN(betId) || betId <= 0) {
    return reply.status(404).send({ error: 'Ставка не найдена' });
  }
  try {
    const getBet = await prisma.bet.findUnique({ where: { id: betId } });
    if (!getBet) {
      return reply.status(404).send({ error: 'Ставка не найдена' });
    }

    reply.send(getBet);
  } catch (error) {
    reply.send(400).send({ error: error.message });
  }
};

export const getRecommendedBet = async (
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'] || {};
  if (!id) {
    reply.status(401).send({ error: 'Пользователь не аутентифицирован' });
  }
  try {
    const userBalance = await prisma.user_Balances.findFirstOrThrow({
      where: { user_id: id },
      select: { balance: true },
    });

    // Преобразуем Decimal баланса в число
    const userBalanceValue = userBalance.balance.toNumber();

    // Проверяем, что баланс позволяет сгенерировать число (минимум 1)
    if (userBalanceValue < 1) {
      throw new Error('Баланс слишком мал для генерации числа');
    }

    // Определяем верхнюю границу для генерации (не больше 5 и не больше баланса)
    const maxPossible = Math.min(5, userBalanceValue);

    // Генерируем случайное целое число в диапазоне [1, maxPossible]
    const randomNumber = Math.floor(Math.random() * maxPossible) + 1;
    reply.send({ recommended_amount: randomNumber });
  } catch (error) {
    reply.send(400).send({ error: error.message });
  }
};
