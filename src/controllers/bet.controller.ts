import { FastifyReply, FastifyRequest } from 'fastify';
import { IBetResultDto, IPlaceBetDto } from '../schemas/Bet';
import { prisma } from '../utils';
import { error } from 'console';

export const placeBet = async (
  request: FastifyRequest<{
    Body: IPlaceBetDto;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'];
  if (!id) {
    reply.status(401).send({ error: 'Ошибка авторизации' });
  }
  const { bet } = request.body || {};
  if (!bet) throw new Error('Неверная сумма ставки');

  try {
    const placeBetResult = await prisma.$transaction(async (prisma) => {
      //  Блокируем запись через специальный метод Prisma
      await prisma.$executeRaw`SELECT 1 FROM user_balances WHERE user_id = ${id} FOR UPDATE`;
      //  Используем findFirst с FOR UPDATE для блокировки
      const userBalance = await prisma.user_Balances.findFirst({
        where: { user_id: id },
        select: { balance: true },
      });

      if (!userBalance) {
        throw new Error('Баланс пользователя не найден');
      }

      // Проверяем достаточность средств
      if (userBalance.balance < bet) {
        throw new Error('Недостаточно средств на балансе');
      }

      const newBet = await prisma.bet.create({
        data: {
          amount: bet,
          status: 'pending',
          win_amount: 0,
          user: {
            connect: {
              id: id,
            },
          },
        },
      });

      // добавление транзакции
      await prisma.transaction.create({
        data: {
          user_id: id,
          bet_id: newBet.id,
          type: 'bet_place',
          amount: -bet,
          balance_before: userBalance.balance,
          balance_after: userBalance.balance - bet,
          description: `Bet placement #${newBet.id}`,
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
  try {
    const getBets = await prisma.bet.findMany();
    reply.send(getBets);
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
};

export const getBetById = async (
  request: FastifyRequest<{
    Params: { id?: string };
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'];
  if (!id) {
    reply.status(401).send({ error: 'Ошибка авторизации' });
  }
  const betId = parseInt(request.params.id, 10);

  // Проверка валидности betId
  if (isNaN(betId) || betId <= 0 || isNaN(Number(id)) || id <= 0) {
    return reply.status(404).send({ error: 'Ставка не найдена' });
  }
  try {
    const getBet = await prisma.bet.findUnique({ where: { id: betId, user_id: id } });
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
    const userBalanceValue = userBalance.balance;

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
export const getBetResult = async (
  request: FastifyRequest<{
    Body: IBetResultDto;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request['authUser'] || {};
  if (!id) {
    reply.status(401).send({ error: 'Пользователь не аутентифицирован' });
  }
  const { bet_id } = request.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Получаем ставку с блокировкой
      const bet = await tx.bet.findFirst({
        where: { id: bet_id },
        select: {
          id: true,
          amount: true,
          status: true,
          user_id: true,
          win_amount: true,
        },
      });
      await tx.$executeRaw`SELECT 1 FROM "Bet" WHERE id = ${bet_id} FOR UPDATE`;

      // Проверки
      if (!bet || bet.user_id !== id || bet.status !== 'pending') {
        throw new Error('Ставка не найдена или уже обработана');
      }
      const userBalance = await tx.user_Balances.findUnique({ where: { user_id: id } });
      //  Генерируем результат (50% вероятность)
      const isWin = Math.random() > 0.5;
      const winAmount = isWin ? bet.amount * 2 : 0;

      // Обновляем ставку
      await tx.bet.update({
        where: { id: bet_id },
        data: {
          status: 'completed',
          win_amount: winAmount,
          completed_at: new Date(),
        },
      });

      // При выигрыше - начисляем средства
      if (isWin) {
        await tx.user_Balances.update({
          where: { user_id: id },
          data: { balance: { increment: winAmount } },
        });

        // добавление транзакции
        await tx.transaction.create({
          data: {
            user_id: id,
            bet_id: bet_id,
            type: 'bet_win',
            amount: winAmount,
            balance_before: userBalance.balance,
            balance_after: userBalance.balance + winAmount,
            description: `Win amount for bet #${bet.id}`,
          },
        });
      }

      return reply.send({
        result: isWin ? 'win' : 'lose',
        win_amount: winAmount,
      });
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Ошибка сервера';
    return reply.status(400).send({ error: message });
  }
};
