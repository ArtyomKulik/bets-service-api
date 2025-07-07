/*
  Warnings:

  - You are about to drop the column `last_checked_at` on the `user_balances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_balances" DROP COLUMN "last_checked_at";
