import { FastifyReply, FastifyRequest } from 'fastify';
import { IBalanceDto } from '../schemas/Balance';
import { prisma, utils } from '../utils';
import { handleServerError } from '../helpers/errors.helper';
import { Prisma } from '@prisma/client';

export const setInitialBalance = async (
  request: FastifyRequest<{
    Body: IBalanceDto;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request['authUser'] || {};
    if(!id) {
        throw new Error('Auth error')
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { user_balances: true },
    });
    if (!user) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    const { balance } = request.body || {};

    if (user.initialBalanceSet) {
      if (balance !== undefined) {
        return reply.status(400).send({ error: 'Initial balance already set' });
      }
      return reply.send({
        balance: user.user_balances?.balance?.toNumber() || 0,
      });
    }
    // Запрос на установку баланса
    if (balance !== undefined) {
      if (Number(balance) < 0 || Number(balance) > 1000) {
        return reply.status(400).send({ error: 'Inital balance cannot be negative or bigger than 1000' });
      }

      await prisma.$transaction([
        prisma.user_Balances.upsert({
          where: { user_id: user.id },
          create: { user_id: user.id, balance: new Prisma.Decimal(balance) },
          update: { balance: new Prisma.Decimal(balance) },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { initialBalanceSet: true },
          
        }),
      ]);

      return reply.send({ balance });
    }

    // Просто возврат баланса (0 если не установлен)
    return reply.send({
      balance: user.user_balances?.balance.toNumber() || 0,
    });
  } catch (err) {
    console.log(err);
    return handleServerError(reply, err);
  }
};
