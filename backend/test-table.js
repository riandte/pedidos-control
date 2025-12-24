const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('Tabela User existe. Contagem:', count);
  } catch (e) {
    console.error('Erro ao acessar tabela User:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();