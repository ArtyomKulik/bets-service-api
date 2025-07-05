import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = Array.from({ length: 30 }, (_, i) => ({
    username: `user${i + 1}`,
    user_balances: {
      create: {
        balance: 0
      }
    }
  }));

  // Создаем пользователей один за другим
  for (const userData of users) {
    await prisma.user.create({
      data: userData
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
