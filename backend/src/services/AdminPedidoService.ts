import prisma from '../config/database';

export class AdminPedidoService {
  async findAll(status?: string) {
    return prisma.pedido.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    return pedido;
  }

  async updateStatus(id: string, status: string) {
    // Validação de Status (Garantia de que status inválido não passa)
    const allowedStatuses = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Status inválido: ${status}. Permitidos: ${allowedStatuses.join(', ')}`);
    }

    // Regra de Negócio: Não pode reabrir pedido cancelado?
    // Por enquanto, vamos manter flexível, mas verificar se o pedido existe.
    const pedidoAtual = await prisma.pedido.findUnique({ where: { id } });
    if (!pedidoAtual) {
      throw new Error('Pedido não encontrado');
    }

    return prisma.pedido.update({
      where: { id },
      data: { status },
    });
  }
}
