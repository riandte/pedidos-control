import { Request, Response } from 'express';
import { CalculoPrecoService, ItemCarrinhoDTO } from '../services/CalculoPrecoService';

export class CarrinhoController {
  private service = new CalculoPrecoService();

  simular = async (req: Request, res: Response) => {
    const itens: ItemCarrinhoDTO[] = req.body.itens;

    if (!itens || !Array.isArray(itens)) {
      return res.status(400).json({ message: 'Formato de itens inválido' });
    }

    try {
      const resultado = await this.service.calcular(itens);
      
      // Se houver erros de validação (min/max), retorna 400
      const temErros = resultado.itens.some(i => i.erros.length > 0);
      if (temErros) {
         return res.status(400).json({ 
           message: 'Erro na validação do carrinho', 
           detalhes: resultado 
         });
      }

      res.json(resultado);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
  };
}
