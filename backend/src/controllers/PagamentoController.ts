import { Request, Response } from 'express';
import prisma from '../config/database';

export class PagamentoController {
  
  // Mock Iniciar Pagamento
  iniciar = async (req: Request, res: Response) => {
    const { pedidoId, metodo } = req.body;

    if (!pedidoId || !metodo) {
        return res.status(400).json({ message: 'Dados inválidos' });
    }

    // In a real scenario, call PIX provider (MercadoPago, Gerencianet, etc.)
    // Here we just return static mock data
    const mockPixData = {
        pagamentoId: `pay_${Math.random().toString(36).substr(2, 9)}`,
        pix: {
            qrCodeUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Rickrolling_QR_code.png', // Placeholder
            copiaCola: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304ABCD'
        }
    };

    return res.json(mockPixData);
  };

  // Mock Webhook (to approve payment manually)
  webhookMock = async (req: Request, res: Response) => {
      const { pagamentoId, status, pedidoId } = req.body;

      if (status === 'APROVADO' && pedidoId) {
          try {
              await prisma.pedido.update({
                  where: { id: pedidoId },
                  data: { 
                      statusPagamento: 'APROVADO',
                      status: 'EM_PREPARO' // Auto advance status
                  }
              });
              return res.json({ message: 'Pagamento aprovado e pedido atualizado' });
          } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Erro ao atualizar pedido' });
          }
      }
      
      return res.json({ message: 'Webhook recebido (sem ação)' });
  };
}
