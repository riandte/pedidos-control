import prisma from '../config/database';

export class CategoriaService {
  async create(nome: string, descricao?: string) {
    return prisma.categoria.create({
      data: {
        nome,
        descricao,
      },
    });
  }

  async findAll() {
    return prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
  }
}
