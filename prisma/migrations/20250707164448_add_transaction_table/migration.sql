/*
  Warnings:

  - You are about to alter the column `balance` on the `user_balances` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `external_balance` on the `user_balances` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "user_balances" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER,
ALTER COLUMN "external_balance" SET DEFAULT 0,
ALTER COLUMN "external_balance" SET DATA TYPE INTEGER;
