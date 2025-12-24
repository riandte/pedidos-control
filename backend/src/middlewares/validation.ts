import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    next(error);
  }
};

export const createPedidoSchema = z.object({
  body: z.object({
    nomeCliente: z.string().min(1, "Nome do cliente é obrigatório"),
    telefoneCliente: z.string().min(1, "Telefone do cliente é obrigatório"),
    tipoEntrega: z.enum(['RETIRADA', 'ENTREGA', 'MESA']),
    itens: z.array(
      z.object({
        itemId: z.string().uuid(),
        quantidade: z.number().int().positive(),
        observacao: z.string().optional(),
        modificadores: z.array(
          z.object({
            modificadorId: z.string().uuid(),
            opcoesId: z.array(z.string().uuid()),
          })
        ).optional(),
      })
    ).min(1, "O pedido deve ter pelo menos um item"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'FINALIZADO', 'CANCELADO']),
  }),
});
