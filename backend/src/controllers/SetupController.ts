import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class SetupController {
  async run(req: Request, res: Response) {
    const { key } = req.query;

    // Proteção básica para evitar que qualquer um rode o seed
    // Em produção, defina SETUP_KEY no .env da Vercel
    if (key !== process.env.SETUP_KEY && key !== 'setup123') {
      return res.status(403).json({ error: 'Chave de setup inválida.' });
    }

    try {
      console.log('Iniciando setup via endpoint...');

      // 1. Users (Admin e Cliente de Teste)
      const password = await bcrypt.hash('123456', 8);

      const admin = await prisma.user.upsert({
        where: { email: 'admin@empresa.com' },
        update: {}, // Não atualiza se já existe
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
        },
      });

      // 2. Configurações
      const config = await prisma.configuracao.findFirst();
      if (!config) {
        await prisma.configuracao.create({
          data: {
            id: 'default',
            nomeLoja: 'Burgueria Exemplo',
            endereco: 'Rua das Flores, 123',
            horario: '18h às 23h',
            mensagem: 'O melhor burger da cidade!',
            aberto: true,
          }
        });
      }

      // 3. Categorias
      let catLanches = await prisma.categoria.findFirst({ where: { nome: 'Lanches' } });
      if (!catLanches) {
        catLanches = await prisma.categoria.create({
          data: { nome: 'Lanches', descricao: 'Artesanais e suculentos', ordem: 1 }
        });
      }

      let catBebidas = await prisma.categoria.findFirst({ where: { nome: 'Bebidas' } });
      if (!catBebidas) {
        catBebidas = await prisma.categoria.create({
          data: { nome: 'Bebidas', descricao: 'Refrescantes', ordem: 2 }
        });
      }

      // 4. Produtos
      const prodBacon = await prisma.produto.findFirst({ where: { nome: 'X-Bacon' } });
      if (!prodBacon && catLanches) {
        await prisma.produto.create({
          data: {
            nome: 'X-Bacon',
            descricao: 'Pão brioche, carne 180g, cheddar e bacon crocante',
            precoBase: 28.00,
            categoriaId: catLanches.id,
            permiteAdicionais: true,
            imagemUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80',
          }
        });
      }

      const prodSalada = await prisma.produto.findFirst({ where: { nome: 'X-Salada' } });
      if (!prodSalada && catLanches) {
        await prisma.produto.create({
          data: {
            nome: 'X-Salada',
            descricao: 'Pão, carne, queijo, alface, tomate e maionese',
            precoBase: 22.00,
            categoriaId: catLanches.id,
            permiteAdicionais: true,
            imagemUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
          }
        });
      }

      const prodCoca = await prisma.produto.findFirst({ where: { nome: 'Coca-Cola' } });
      if (!prodCoca && catBebidas) {
        await prisma.produto.create({
          data: {
            nome: 'Coca-Cola',
            descricao: 'Lata 350ml',
            precoBase: 6.00,
            categoriaId: catBebidas.id,
            permiteAdicionais: false,
            imagemUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
          }
        });
      }

      return res.json({ 
        message: 'Setup concluído! Banco de dados populado.', 
        data: { 
          admin: admin.email,
          categorias: [catLanches?.nome, catBebidas?.nome]
        } 
      });

    } catch (error) {
      console.error('Erro no setup:', error);
      return res.status(500).json({ error: 'Erro interno durante setup', details: String(error) });
    }
  }
}
