import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';

export class ProdutoController {
  private service = new ProdutoService();

  create = async (req: Request, res: Response) => {
    const { nome, categoriaId, precoBase, descricao, tempoPreparoMin, imagemUrl, permiteAdicionais, gruposAdicionais } = req.body;

    if (!nome || !categoriaId || precoBase === undefined) {
      return res.status(400).json({ message: 'Nome, categoriaId e precoBase são obrigatórios' });
    }

    try {
        const produto = await this.service.create({
          nome,
          categoriaId,
          precoBase: Number(precoBase),
          descricao,
          tempoPreparoMin: tempoPreparoMin ? Number(tempoPreparoMin) : undefined,
          imagemUrl,
          permiteAdicionais: Boolean(permiteAdicionais),
          gruposAdicionais // Expecting array of strings (IDs)
        });
    
        return res.status(201).json(produto);
    } catch (err: any) {
        return res.status(500).json({ message: 'Erro ao criar produto', error: err.message });
    }
  };

  index = async (req: Request, res: Response) => {
    // Check if admin request to show all
    const isAdmin = (req as any).userRole === 'ADMIN'; 
    // Note: 'userRole' comes from authMiddleware. If public route, it's undefined.
    // If this route is protected for admin, it's fine. 
    // But currently `router.get('/produtos')` is public.
    // We should probably have `/admin/produtos` separate or use query param?
    // Let's use query param `mode=admin` protected by middleware logic if we want, 
    // OR just use separate endpoint.
    // The requirement says "CRUD DE ITENS (PRODUTOS) — ADMIN".
    // Admin needs to see deactivated products.
    // Client sees only active.
    // Let's assume if the user is authenticated as ADMIN, we return all.
    // But wait, `index` is public.
    // I will modify route `router.get('/admin/produtos', ...)` to call `indexAdmin`.
    
    const produtos = await this.service.findAll(false); // Default public
    return res.json(produtos);
  };
  
  indexAdmin = async (req: Request, res: Response) => {
      const produtos = await this.service.findAll(true);
      return res.json(produtos);
  };

  show = async (req: Request, res: Response) => {
    const { id } = req.params;
    const produto = await this.service.findById(id);

    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    return res.json(produto);
  };

  update = async (req: Request, res: Response) => {
      const { id } = req.params;
      const { 
          nome, 
          categoriaId, 
          precoBase, 
          descricao, 
          tempoPreparoMin, 
          imagemUrl, 
          ativo, 
          permiteAdicionais, 
          gruposAdicionais 
      } = req.body;
      
      const data = {
          nome, 
          categoriaId, 
          precoBase: precoBase !== undefined ? Number(precoBase) : undefined, 
          descricao, 
          tempoPreparoMin: tempoPreparoMin !== undefined ? Number(tempoPreparoMin) : undefined, 
          imagemUrl, 
          ativo: ativo !== undefined ? Boolean(ativo) : undefined, 
          permiteAdicionais: permiteAdicionais !== undefined ? Boolean(permiteAdicionais) : undefined, 
          gruposAdicionais
      };

      // Clean undefined
      Object.keys(data).forEach(key => (data as any)[key] === undefined && delete (data as any)[key]);
      
      try {
          const produto = await this.service.update(id, data);
          return res.json(produto);
      } catch (err: any) {
          return res.status(500).json({ message: 'Erro ao atualizar produto', error: err.message });
      }
  };
}
