
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_STATUSES = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO', 'FINALIZADO'];

async function main() {
  const args = process.argv.slice(2);
  const orderId = args[0];
  const newStatus = args[1];

  if (!orderId || !newStatus) {
    console.error('Uso: npx ts-node scripts/update_order_status.ts <ORDER_ID> <NEW_STATUS>');
    console.error('Status permitidos:', ALLOWED_STATUSES.join(', '));
    process.exit(1);
  }

  const status = newStatus.toUpperCase();

  if (!ALLOWED_STATUSES.includes(status)) {
     console.error(`Status inválido: ${newStatus}.`);
     console.error('Status permitidos:', ALLOWED_STATUSES.join(', '));
     process.exit(1);
  }

  try {
    const updatedOrder = await prisma.pedido.update({
      where: { id: orderId },
      data: { status }
    });
    console.log(`\n✅ Sucesso! Pedido ${updatedOrder.id} atualizado para ${updatedOrder.status}.`);
  } catch (error) {
    console.error('\n❌ Erro ao atualizar pedido. Verifique o ID e a conexão com o banco de dados.');
    console.error(error);
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
