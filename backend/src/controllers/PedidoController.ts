import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';
import prisma from '../config/database';

export class PedidoController {
  private service = new PedidoService();

  create = async (req: Request, res: Response) => {
    const userId = (req as any).userId; // From authMiddleware (optional)
    const { nomeCliente, telefone, tipoEntrega, itens } = req.body;

    // Validate Store Status
    const config = await prisma.configuracao.findUnique({ where: { id: 'default' } });
    if (config && !config.aberto) {
      return res.status(403).json({ 
        message: 'A loja está fechada no momento. Tente novamente dentro do horário de funcionamento.' 
      });
    }

    // if (!userId) {
    //    return res.status(401).json({ message: 'Usuário não autenticado' });
    // }

    if (!nomeCliente || !tipoEntrega || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: 'Dados inválidos. Informe nomeCliente, tipoEntrega e itens.' });
    }

    try {
      const pedido = await this.service.create({ 
        userId, 
        nomeCliente,
        telefone,
        tipoEntrega, 
        itens 
      });
      res.status(201).json(pedido);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  };
}
