import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/prisma.config';
import { getErrorMessage } from '../helpers/errors.helper';
import { ITransactionService } from '../services/transaction.service';

export const getTransactions =
  (transactionService: ITransactionService) =>
  async (
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request['authUser'] || {};
    if (!id) {
      return reply.status(401).send({ error: 'Ошибка авторизации' });
    }
    try {
      const query = request.query;
      const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
      const limit = parseInt(query.limit || '10', 10) || 10;

      if (!Number.isInteger(page) || !Number.isInteger(limit)) {
        return reply.status(400).send({ error: 'Pagination parameters must be integers' });
      }
      if (page < 1 || limit < 1) {
        return reply.status(400).send({ error: 'Pagination parameters must be positive' });
      }

      const result = await transactionService.get({ userId: id, page, limit });

      reply.send({
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.pages,
        },
      });
    } catch (error) {
      reply.status(400).send({ error: getErrorMessage(error) });
    }
  };
