import prisma from '../config/database';

interface CreateProdutoDTO {
  nome: string;
  categoriaId: string;
  precoBase: number;
  descricao?: string;
  tempoPreparoMin?: number;
  imagemUrl?: string;
  permiteAdicionais?: boolean;
  gruposAdicionais?: string[]; // IDs
}

interface UpdateProdutoDTO extends Partial<CreateProdutoDTO> {
  ativo?: boolean;
}

export class ProdutoService {
  async create(data: CreateProdutoDTO) {
    const { gruposAdicionais, ...rest } = data;
    
    return prisma.produto.create({
      data: {
        ...rest,
        ativo: true,
        gruposAdicionais: gruposAdicionais ? {
            connect: gruposAdicionais.map(id => ({ id }))
        } : undefined
      },
      include: {
          gruposAdicionais: true
      }
    });
  }

  async update(id: string, data: UpdateProdutoDTO) {
    const { gruposAdicionais, ...rest } = data;

    // Logic for updating groups:
    // If gruposAdicionais is passed, we replace the connections.
    // Prisma `set` replaces all relations with the new list.
    
    const updateData: any = { ...rest };
    
    if (gruposAdicionais !== undefined) {
        updateData.gruposAdicionais = {
            set: gruposAdicionais.map(gid => ({ id: gid }))
        };
    }

    return prisma.produto.update({
        where: { id },
        data: updateData,
        include: { gruposAdicionais: true }
    });
  }

  async findAll(admin = false) {
    // If admin, show all (including inactive if needed, or maybe filter param).
    // For now, let's return all for admin, active for client.
    // The previous implementation hardcoded `where: { ativo: true }`.
    
    // Let's keep `findAll` for client (active only) and add `findAllAdmin`?
    // Or just check param.
    const where = admin ? {} : { ativo: true };
    
    return prisma.produto.findMany({
      where,
      include: {
        categoria: true,
        gruposAdicionais: true
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        gruposAdicionais: {
          include: {
            adicionais: true
          }
        }
      },
    });
  }
}
