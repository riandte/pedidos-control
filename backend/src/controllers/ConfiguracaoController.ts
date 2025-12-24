import { Request, Response } from 'express';
import prisma from '../config/database';

export class ConfiguracaoController {
  show = async (req: Request, res: Response) => {
    try {
      let config = await prisma.configuracao.findUnique({
        where: { id: 'default' }
      });
      
      if (!config) {
        config = await prisma.configuracao.create({
            data: { id: 'default' }
        });
      }

      return res.json(config);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar configurações' });
    }
  };

  update = async (req: Request, res: Response) => {
    const { nomeLoja, endereco, horario, mensagem, aberto } = req.body;
    try {
      const config = await prisma.configuracao.upsert({
        where: { id: 'default' },
        update: {
            nomeLoja,
            endereco,
            horario,
            mensagem,
            aberto
        },
        create: {
            id: 'default',
            nomeLoja,
            endereco,
            horario,
            mensagem,
            aberto
        }
      });
      return res.json(config);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar configurações' });
    }
  };
}
