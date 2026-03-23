// test-db.ts
import prisma from './lib/prisma';

async function testConnection() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Connection OK! Found users:', users);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();