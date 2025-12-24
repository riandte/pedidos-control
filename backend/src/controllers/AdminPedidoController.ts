import { Request, Response } from 'express';
import { AdminPedidoService } from '../services/AdminPedidoService';

export class AdminPedidoController {
  private service = new AdminPedidoService();

  index = async (req: Request, res: Response) => {
    const { status } = req.query;
    
    // Validação básica se o status passado na query é válido
    const allowedStatuses = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];
    let statusFilter: string | undefined;

    if (status && typeof status === 'string' && allowedStatuses.includes(status)) {
      statusFilter = status;
    }

    const pedidos = await this.service.findAll(statusFilter);
    res.json(pedidos);
  };

  show = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const pedido = await this.service.findById(id);
      res.json(pedido);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status é obrigatório' });
    }

    try {
      const pedido = await this.service.updateStatus(id, status);
      res.json(pedido);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
