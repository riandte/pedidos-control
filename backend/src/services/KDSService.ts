import prisma from '../config/database';

export class KDSService {
  async getFila() {
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: 'EM_PREPARO',
      },
      orderBy: {
        createdAt: 'asc', // FIFO: Mais antigos primeiro
      },
      select: {
        id: true,
        nomeCliente: true,
        createdAt: true,
        numero: true, // Se tiver número do pedido (autoincrement ou similar)
        itens: {
          select: {
            id: true,
            quantidade: true,
            nomeProduto: true,
            observacao: true,
            adicionais: {
              select: {
                nomeAdicional: true,
                // Sem preço
              },
            },
          },
        },
      },
    });

    return pedidos;
  }

  async marcarComoPronto(pedidoId: string) {
    // Verifica se o pedido existe e está na cozinha
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.status !== 'EM_PREPARO') {
      throw new Error('Pedido não está em preparo (pode já ter sido finalizado ou cancelado)');
    }

    return prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        status: 'PRONTO',
      },
    });
  }
}
