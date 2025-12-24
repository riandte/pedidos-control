import { Request, Response } from 'express';
import prisma from '../config/database';

export class GrupoAdicionalController {
  index = async (req: Request, res: Response) => {
    try {
      const grupos = await prisma.grupoAdicional.findMany({
        include: {
          adicionais: true
        },
        orderBy: { nome: 'asc' }
      });
      return res.json(grupos);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar grupos' });
    }
  };

  show = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const grupo = await prisma.grupoAdicional.findUnique({
        where: { id },
        include: {
          adicionais: true
        }
      });
      if (!grupo) return res.status(404).json({ message: 'Grupo não encontrado' });
      return res.json(grupo);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar grupo' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { nome, minEscolhas, maxEscolhas, adicionais } = req.body;
    // adicionais: [{ nome, preco, ingredienteRefId? }]

    try {
      const grupo = await prisma.grupoAdicional.create({
        data: {
          nome,
          minEscolhas: Number(minEscolhas),
          maxEscolhas: Number(maxEscolhas),
          adicionais: {
            create: adicionais?.map((ad: any) => ({
              nome: ad.nome,
              preco: ad.preco,
              ingredienteRefId: ad.ingredienteRefId || null
            }))
          }
        },
        include: { adicionais: true }
      });
      return res.status(201).json(grupo);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar grupo', error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, minEscolhas, maxEscolhas, adicionais } = req.body; 
    // Logic: Update group details. Replace all adicionais or update them?
    // "Simple" logic: Delete all old ones and recreate, or smart update.
    // For MVP Admin, let's try to update existing by ID if present, create new if not, delete missing.
    // Or just simple: Update Group fields, and if 'adicionais' provided, handle them.

    try {
      // 1. Update basic info
      await prisma.grupoAdicional.update({
        where: { id },
        data: {
          nome,
          minEscolhas: Number(minEscolhas),
          maxEscolhas: Number(maxEscolhas),
        }
      });

      // 2. Handle Adicionais if array is sent
      if (Array.isArray(adicionais)) {
         // Get existing IDs
         const existing = await prisma.adicional.findMany({ where: { grupoId: id } });
         const existingIds = existing.map(a => a.id);
         
         const incomingIds = adicionais.filter(a => a.id).map(a => a.id);
         
         // Delete removed
         const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
         if (toDelete.length > 0) {
            await prisma.adicional.deleteMany({ where: { id: { in: toDelete } } });
         }

         // Upsert
         for (const ad of adicionais) {
            if (ad.id) {
                await prisma.adicional.update({
                    where: { id: ad.id },
                    data: {
                        nome: ad.nome,
                        preco: ad.preco,
                        ingredienteRefId: ad.ingredienteRefId || null
                    }
                });
            } else {
                await prisma.adicional.create({
                    data: {
                        grupoId: id,
                        nome: ad.nome,
                        preco: ad.preco,
                        ingredienteRefId: ad.ingredienteRefId || null
                    }
                });
            }
         }
      }

      const updated = await prisma.grupoAdicional.findUnique({
        where: { id },
        include: { adicionais: true }
      });

      return res.json(updated);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar grupo' });
    }
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.grupoAdicional.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao deletar grupo' });
    }
  };
}
