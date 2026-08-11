import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 10,
    });

    console.log('=== Existing users in database ===');
    users.forEach(u => {
      console.log(`${u.email} (Role: ${u.role})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
