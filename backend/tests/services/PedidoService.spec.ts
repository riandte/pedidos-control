import { describe, it, expect, vi } from 'vitest';
import { PedidoService } from '../../src/services/PedidoService';
import { CalculoPrecoService } from '../../src/services/CalculoPrecoService';

// Mock database to avoid PrismaClient instantiation error
vi.mock('../../src/config/database', () => ({
  default: {
    pedido: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({
      pedido: {
        create: vi.fn(),
      },
      pedidoItem: {
        create: vi.fn().mockResolvedValue({ id: 'pi-1' }),
      },
      pedidoItemOpcao: {
        create: vi.fn(),
      }
    })),
  }
}));

// Mock CalculoPrecoService
vi.mock('../../src/services/CalculoPrecoService');

import prisma from '../../src/config/database';

describe('PedidoService', () => {
  it('deve criar um pedido com sucesso', async () => {
    // Mock calculation response matching actual structure
    const mockCalcular = vi.fn().mockResolvedValue({
      total: 50,
      itens: [] 
    });
    
    // Setup mock implementation BEFORE instantiation
    (CalculoPrecoService as any).prototype.calcular = mockCalcular;

    const pedidoService = new PedidoService();

    // Setup Prisma mock for this specific test
    const mockCreatePedido = vi.fn().mockResolvedValue({
      id: 'ped-123',
      total: 50,
      status: 'RECEBIDO'
    });
    
    // We need to mock the transaction callback's tx.pedido.create
    // The global mock above defines $transaction to call the cb with a mockTx object
    // We need to ensure THAT mockTx object has the behavior we want
    // But since I defined it inline in the factory, I can't easily access it here to change it per test
    // So I will redefine the $transaction mock here.
    
    (prisma.$transaction as any) = vi.fn(async (cb) => {
        const mockTx = {
            pedido: {
                create: mockCreatePedido
            },
            pedidoItem: {
                create: vi.fn().mockResolvedValue({ id: 'item-1' })
            },
            pedidoItemOpcao: {
                create: vi.fn()
            }
        };
        return cb(mockTx);
    });

    const result = await pedidoService.create({
      nomeCliente: 'Rian',
      itens: []
    });

    expect(result.id).toBe('ped-123');
    expect(mockCreatePedido).toHaveBeenCalled();
  });
});
