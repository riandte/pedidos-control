import { CalculoPrecoService, ItemCarrinhoDTO } from './CalculoPrecoService';
import prisma from '../config/database';

interface CreatePedidoDTO {
  userId?: string;
  nomeCliente: string; // Snapshot ou nome de quem vai retirar
  telefone?: string;
  tipoEntrega: string;
  itens: ItemCarrinhoDTO[];
}

export class PedidoService {
  private calculoService = new CalculoPrecoService();

  async create(data: CreatePedidoDTO) {
    // 1. REAPROVEITAMENTO: Usa o mesmo serviço de cálculo para validar e totalizar
    const calculo = await this.calculoService.calcular(data.itens);

    // 2. Validação final (Garantia de integridade)
    const temErros = calculo.itens.some((i) => i.erros.length > 0);
    if (temErros) {
      throw new Error(
        `Pedido inválido. Erros: ${JSON.stringify(
          calculo.itens.filter((i) => i.erros.length > 0).map((i) => i.erros)
        )}`
      );
    }

    // 3. Persistência Transacional (Atomicidade)
    const pedidoCriado = await prisma.$transaction(async (tx) => {
      // Verifica se o usuário existe (caso userId seja fornecido)
      let validUserId = data.userId;
      if (validUserId) {
        const userExists = await tx.user.findUnique({ where: { id: validUserId } });
        if (!userExists) {
          validUserId = undefined; // Fallback para guest se o ID for inválido (token antigo/inválido)
        }
      }

      // Simulação de autoincrement para SQLite (CORRIGIDO)
      const lastPedido = await tx.pedido.findFirst({
        orderBy: { numero: 'desc' }
      });
      const novoNumero = (lastPedido?.numero || 0) + 1;

      // Cria o Header do Pedido
      const pedido = await tx.pedido.create({
        data: {
          numero: novoNumero,
          userId: validUserId,
          nomeCliente: data.nomeCliente,
          telefone: data.telefone,
          tipoEntrega: data.tipoEntrega,
          status: 'RECEBIDO',
          statusPagamento: 'PENDENTE',
          total: calculo.total,
        },
      });

      // Itera sobre os itens CALCULADOS (não o input bruto) para garantir valores corretos
      for (const itemCalculado of calculo.itens) {
        const pedidoItem = await tx.pedidoItem.create({
          data: {
            pedidoId: pedido.id,
            produtoId: itemCalculado.produtoId, // Referência
            
            // SNAPSHOT: Dados copiados para garantir histórico imutável
            nomeProduto: itemCalculado.nome,
            precoUnitario: itemCalculado.precoUnitarioBase,
            quantidade: itemCalculado.quantidade,
            totalItem: itemCalculado.totalItem,
            observacao: itemCalculado.observacao,
          },
        });

        // Salva as opções escolhidas (Snapshot de preço também)
        for (const ad of itemCalculado.adicionais) {
          await tx.pedidoItemAdicional.create({
            data: {
              pedidoItemId: pedidoItem.id,
              adicionalId: ad.adicionalId,
              nomeAdicional: ad.nome,
              precoAdicional: ad.preco, // Preço REAL cobrado
            },
          });
        }
      }

      return pedido;
    });

    return pedidoCriado;
  }
}
