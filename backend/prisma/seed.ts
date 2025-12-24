import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  console.log('Database URL:', process.env.DATABASE_URL);

  // 1. Users
  const password = await bcrypt.hash('123456', 8);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@empresa.com',
      senha: password,
      tipo: 'ADMIN',
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      nome: 'Cliente Teste',
      email: 'cliente@teste.com',
      senha: password,
      tipo: 'CLIENTE',
      endereco: 'Rua Teste, 123',
      telefone: '11999999999',
    },
  });

  console.log({ admin, cliente });

  // 2. Categoria
  const catLanches = await prisma.categoria.create({
    data: {
      nome: 'Lanches',
      descricao: 'Artesanais e suculentos',
      ordem: 1,
    }
  });
  
  const catBebidas = await prisma.categoria.create({
    data: {
      nome: 'Bebidas',
      descricao: 'Refrescantes',
      ordem: 2,
    }
  });

  // 3. Ingredientes (Independentes)
  const pao = await prisma.ingrediente.create({ data: { nome: 'Pão Brioche' } });
  const carne = await prisma.ingrediente.create({ data: { nome: 'Carne 180g' } });
  const queijo = await prisma.ingrediente.create({ data: { nome: 'Queijo Cheddar' } });
  const bacon = await prisma.ingrediente.create({ data: { nome: 'Bacon' } });
  const alface = await prisma.ingrediente.create({ data: { nome: 'Alface' } });

  // 4. Produto
  const xBacon = await prisma.produto.create({
    data: {
      nome: 'X-Bacon',
      descricao: 'Pão, carne, queijo e muito bacon',
      precoBase: 25.00,
      categoriaId: catLanches.id,
      permiteAdicionais: true,
      imagemUrl: 'https://placehold.co/400',
    }
  });

  const coca = await prisma.produto.create({
    data: {
      nome: 'Coca-Cola Lata',
      descricao: '350ml',
      precoBase: 6.00,
      categoriaId: catBebidas.id,
      permiteAdicionais: false,
    }
  });

  // Vincula ingredientes (Ficha técnica)
  await prisma.produtoIngrediente.createMany({
    data: [
      { produtoId: xBacon.id, ingredienteId: pao.id },
      { produtoId: xBacon.id, ingredienteId: carne.id },
      { produtoId: xBacon.id, ingredienteId: queijo.id },
      { produtoId: xBacon.id, ingredienteId: bacon.id },
    ]
  });

  // 5. Grupos de Adicionais
  const grupoExtras = await prisma.grupoAdicional.create({
    data: {
      nome: 'Extras',
      minEscolhas: 0,
      maxEscolhas: 3,
      produtos: {
        connect: { id: xBacon.id }
      }
    }
  });

  // 6. Adicionais
  await prisma.adicional.create({
    data: {
      nome: 'Bacon Extra',
      preco: 5.00,
      grupoId: grupoExtras.id,
      ingredienteRefId: bacon.id, // Referência
    }
  });

  await prisma.adicional.create({
    data: {
      nome: 'Queijo Extra',
      preco: 3.00,
      grupoId: grupoExtras.id,
      ingredienteRefId: queijo.id,
    }
  });

  await prisma.adicional.create({
    data: {
      nome: 'Ovo',
      preco: 2.00,
      grupoId: grupoExtras.id,
      // Sem ingredienteRefId
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
