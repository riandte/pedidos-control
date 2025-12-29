
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const orders = await prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    console.log('\n--- Últimos 20 Pedidos ---');
    if (orders.length === 0) {
      console.log('Nenhum pedido encontrado.');
    } else {
      orders.forEach(order => {
        console.log(`ID: ${order.id}`);
        console.log(`Cliente: ${order.nomeCliente} | Status: ${order.status} | Total: R$ ${Number(order.total).toFixed(2)}`);
        console.log('------------------------------------------------');
      });
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
