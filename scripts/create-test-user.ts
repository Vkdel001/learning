import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test user...');

  const user = await prisma.user.upsert({
    where: { id: 'test-user-id' },
    update: {},
    create: {
      id: 'test-user-id',
      name: 'Test Student',
      email: 'test@example.com',
      grade: 9,
      isUnder18: true,
      authProvider: 'otp',
    },
  });

  console.log('✅ Test user created:', user);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
