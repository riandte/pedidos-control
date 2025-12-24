import { Request, Response } from 'express';
import prisma from '../config/database';

export class IngredienteController {
  index = async (req: Request, res: Response) => {
    try {
      const ingredientes = await prisma.ingrediente.findMany({
        orderBy: { nome: 'asc' }
      });
      return res.json(ingredientes);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar ingredientes' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { nome, ativo } = req.body;
    try {
      const ingrediente = await prisma.ingrediente.create({
        data: { nome, ativo }
      });
      return res.status(201).json(ingrediente);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar ingrediente' });
    }
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, ativo } = req.body;
    try {
      const ingrediente = await prisma.ingrediente.update({
        where: { id },
        data: { nome, ativo }
      });
      return res.json(ingrediente);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar ingrediente' });
    }
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.ingrediente.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao deletar ingrediente' });
    }
  };
}
