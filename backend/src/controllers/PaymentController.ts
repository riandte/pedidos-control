import { Request, Response } from 'express';
import { createPixPayment, getPaymentStatus } from '../services/PaymentService';
import prisma from '../config/database';

export class PaymentController {
  
  // Creates a Pix Payment for an existing Order
  createPix = async (req: Request, res: Response) => {
    const { pedidoId } = req.body;

    try {
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: { user: true }
      });

      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      // Default email if user is not logged in or doesn't have one
      const email = pedido.user?.email || 'cliente@loja.com';
      const firstName = pedido.nomeCliente.split(' ')[0] || 'Cliente';

      const paymentData = await createPixPayment(pedido.id, Number(pedido.total), {
        email,
        firstName
      });

      res.status(201).json(paymentData);
    } catch (error: any) {
        console.error('Erro detalhado ao gerar Pix:', error);
        // Tenta extrair mensagem de erro da API do Mercado Pago se existir
        const mpError = error.cause?.message || error.message || 'Erro desconhecido';
        res.status(500).json({ 
            message: 'Erro ao gerar Pix',
            detail: mpError
        });
    }
  };

  // Webhook to receive updates from Mercado Pago
  webhook = async (req: Request, res: Response) => {
    const { type, data } = req.body;

    if (type === 'payment') {
      try {
        const payment = await getPaymentStatus(data.id);
        
        if (payment.status === 'approved') {
            const pedidoId = payment.external_reference;
            
            if (pedidoId) {
                await prisma.pedido.update({
                    where: { id: pedidoId },
                    data: { 
                        statusPagamento: 'APROVADO',
                        // Optionally update status to 'PREPARANDO' if it was waiting for payment
                    }
                });
                console.log(`Pagamento aprovado para pedido ${pedidoId}`);
            }
        }
      } catch (error) {
        console.error('Erro ao processar webhook:', error);
      }
    }

    res.status(200).send('OK');
  };

  // Check status (for frontend polling)
  checkStatus = async (req: Request, res: Response) => {
      const { pedidoId } = req.params;
      
      try {
          const pedido = await prisma.pedido.findUnique({
              where: { id: pedidoId },
              select: { statusPagamento: true }
          });
          
          if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
          
          res.json({ statusPagamento: pedido.statusPagamento });
      } catch (error) {
          res.status(500).json({ message: 'Erro ao verificar status' });
      }
  }
}
