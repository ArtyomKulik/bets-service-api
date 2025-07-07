import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';

export const getTransactions = async (
  request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
  reply: FastifyReply,
) => {
  try {
    const query = request.query;

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = parseInt(query.limit || '10', 10) || 10;

    // Проверка на целые числа
    if (!Number.isInteger(page) || !Number.isInteger(limit)) {
      return reply.status(400).send({ error: 'Pagination parameters must be integers' });
    }

    // Проверка на положительные значения
    if (page < 1 || limit < 1) {
      return reply.status(400).send({ error: 'Pagination parameters must be positive' });
    }

    const skip = (page - 1) * limit;
    // Получаем транзакции с пагинацией
    const transactions = await prisma.transaction.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // Получаем общее количество транзакций
    const total = await prisma.transaction.count();

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(total / limit);

    reply.send({
      transactions: transactions.map((t) => ({
        ...t,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
};
