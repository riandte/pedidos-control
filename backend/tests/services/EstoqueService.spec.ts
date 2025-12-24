import { describe, it, expect, vi } from 'vitest';
import { EstoqueService } from '../../src/services/EstoqueService';

// Mock database to avoid PrismaClient instantiation error
vi.mock('../../src/config/database', () => ({
  default: {
    ingrediente: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    itemIngrediente: {
      create: vi.fn(),
    }
  }
}));

describe('EstoqueService', () => {
  const estoqueService = new EstoqueService();

  it('deve baixar estoque corretamente quando pedido entra em preparo', async () => {
    // Mock Transaction Client
    const mockTx = {
      pedido: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'ped-1',
          itens: [
            { itemId: 'item-1', quantidade: 2 }
          ]
        })
      },
      item: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'item-1',
          ingredientes: [
            { ingredienteId: 'ing-1', quantidade: 2 } // 2 unidades por item
          ]
        })
      },
      ingrediente: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'ing-1',
          nome: 'Carne',
          estoqueAtual: 10,
          estoqueMinimo: 2,
          unidade: 'un'
        }),
        update: vi.fn().mockResolvedValue({})
      }
    };

    await estoqueService.baixarEstoque('ped-1', mockTx);

    // Assert: Check if update was called with correct decrement
    expect(mockTx.ingrediente.update).toHaveBeenCalledWith({
      where: { id: 'ing-1' },
      data: {
        estoqueAtual: {
          decrement: 4 // 2 itens * 2 unidades = 4
        }
      }
    });
  });

  it('deve lançar erro se estoque insuficiente', async () => {
     const mockTx = {
      pedido: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'ped-fail',
          itens: [{ itemId: 'item-1', quantidade: 1 }]
        })
      },
      item: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'item-1',
          ingredientes: [{ ingredienteId: 'ing-low', quantidade: 5 }]
        })
      },
      ingrediente: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'ing-low',
          nome: 'Ouro',
          estoqueAtual: 3, // Precisa de 5, tem 3
          estoqueMinimo: 0,
          unidade: 'g'
        }),
        update: vi.fn()
      }
    };

    await expect(estoqueService.baixarEstoque('ped-fail', mockTx))
      .rejects
      .toThrow(/Estoque insuficiente de Ouro/);
    
    expect(mockTx.ingrediente.update).not.toHaveBeenCalled();
  });
});
