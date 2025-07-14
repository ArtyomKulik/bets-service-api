import { Prisma, Transaction } from '@prisma/client';
import prisma from '../config/prisma.config';

type GetTransactionType = {
  userId: number;
  page: number;
  limit: number;
};

type GetTransactionsResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type CreateTransactionType = {
  userId: number;
  betId: number;
  type: 'bet_win' | 'bet_placement';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
};

export interface ITransactionService {
  get({ userId, page, limit }: GetTransactionType): Promise<GetTransactionsResponse>;
  createInTransaction(
    data: CreateTransactionType,
    tx: Prisma.TransactionClient,
  ): Promise<Transaction>;
}
export class TransactionService implements ITransactionService {
  async get({ userId, page, limit }: GetTransactionType) {
    const skip = (page - 1) * limit;
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });
    const total = await prisma.transaction.count({ where: { user_id: userId } });
    const pages = Math.ceil(total / limit);

    return {
      transactions,
      total,
      page,
      limit,
      pages,
    };
  }

  async createInTransaction(
    data: CreateTransactionType,
    tx: Prisma.TransactionClient,
  ): Promise<Transaction> {
    return tx.transaction.create({
      data: this.mapToPrisma(data),
    });
  }

  private mapToPrisma(data: CreateTransactionType): Prisma.TransactionCreateInput {
    return {
      user: { connect: { id: data.userId } },
      bet: { connect: { id: data.betId } },
      type: data.type,
      amount: data.amount,
      balance_before: data.balanceBefore,
      balance_after: data.balanceAfter,
      description: data.description,
    };
  }
}

// async create({
//   userId,
//   betId,
//   type,
//   amount,
//   balanceBefore,
//   balanceAfter,
//   description,
// }: CreateTransactionType) {
//  return prisma.transaction.create({
//     data: {
//       user_id: userId,
//       bet_id: betId,
//       type: type,
//       amount: amount,
//       balance_before: balanceBefore,
//       balance_after: balanceAfter,
//       description: description,
//     },
//   });
// }
