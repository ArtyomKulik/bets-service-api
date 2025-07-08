import { External_Api_Account, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Шаг 1: Создаем 30 External_Api_Account
  const apiAccounts: External_Api_Account[] = [];
  for (let i = 1; i <= 30; i++) {
    const account = await prisma.external_Api_Account.create({
      data: {
        external_user_id: `ext-${i}`, // Уникальный ID
        external_secret_key: '14c4b06b824ec593239362517f538b29',
      },
    });
    apiAccounts.push(account);
    console.log(`Created API Account: ext-${i}`);
  }

  // Шаг 2: Создаем 30 User
  const users: User[] = [];
  for (let i = 1; i <= 30; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        initialBalanceSet: false,
      },
    });
    users.push(user);
    console.log(`Created User: user${i}`);
  }

  // Шаг 3: Связываем каждый API Account с соответствующим User
  for (let i = 0; i < 30; i++) {
    await prisma.external_Api_Account.update({
      where: { id: apiAccounts[i].id },
      data: {
        user: {
          connect: { id: users[i].id },
        },
      },
    });
    console.log(`Linked API Account ext-${i + 1} to User user${i + 1}`);
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
