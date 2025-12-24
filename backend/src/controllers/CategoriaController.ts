import { Request, Response } from 'express';
import { CategoriaService } from '../services/CategoriaService';

export class CategoriaController {
  private service = new CategoriaService();

  create = async (req: Request, res: Response) => {
    const { nome, descricao } = req.body;
    
    // Simples validação manual (ideal usar Zod no futuro)
    if (!nome) {
      throw new Error('Nome é obrigatório');
    }

    const categoria = await this.service.create(nome, descricao);
    res.status(201).json(categoria);
  };

  index = async (req: Request, res: Response) => {
    const categorias = await this.service.findAll();
    res.json(categorias);
  };
}
