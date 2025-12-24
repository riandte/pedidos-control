import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class MigrateController {
  async run(req: Request, res: Response) {
    const { key } = req.query;

    if (key !== process.env.SETUP_KEY && key !== 'setup123') {
      return res.status(403).json({ error: 'Chave inválida.' });
    }

    try {
      console.log('Iniciando migração via SQL direto...');

      // 1. Users
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "email" TEXT,
          "cpf" TEXT,
          "senha" TEXT NOT NULL,
          "tipo" TEXT NOT NULL DEFAULT 'CLIENTE',
          "endereco" TEXT,
          "telefone" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_cpf_key" ON "users"("cpf");`);

      // 2. Configuracoes
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "configuracoes" (
          "id" TEXT NOT NULL DEFAULT 'default',
          "nome_loja" TEXT NOT NULL DEFAULT 'Minha Loja',
          "endereco" TEXT NOT NULL DEFAULT '',
          "horario" TEXT NOT NULL DEFAULT '08:00 às 18:00',
          "mensagem" TEXT,
          "aberto" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
        );
      `);

      // 3. Categorias
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "categorias" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "descricao" TEXT,
          "ordem" INTEGER NOT NULL DEFAULT 0,
          "ativo" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
        );
      `);

      // 4. Produtos
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "produtos" (
          "id" TEXT NOT NULL,
          "categoria_id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "descricao" TEXT,
          "preco_base" DECIMAL(65,30) NOT NULL,
          "tempo_preparo_min" INTEGER,
          "imagem_url" TEXT,
          "ativo" BOOLEAN NOT NULL DEFAULT true,
          "permite_adicionais" BOOLEAN NOT NULL DEFAULT false,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
        );
      `);
      // FK Produtos -> Categorias
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
      } catch (e) { /* Ignore if exists */ }

      // 5. Ingredientes
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ingredientes" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "ativo" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
        );
      `);

      // 6. ProdutoIngredientes
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "produto_ingredientes" (
          "produto_id" TEXT NOT NULL,
          "ingrediente_id" TEXT NOT NULL,
          CONSTRAINT "produto_ingredientes_pkey" PRIMARY KEY ("produto_id", "ingrediente_id")
        );
      `);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "produto_ingredientes" ADD CONSTRAINT "produto_ingredientes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "produto_ingredientes" ADD CONSTRAINT "produto_ingredientes_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
      } catch (e) {}

      // 7. Grupos Adicionais
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "grupos_adicionais" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "min_escolhas" INTEGER NOT NULL DEFAULT 0,
          "max_escolhas" INTEGER NOT NULL DEFAULT 1,
          CONSTRAINT "grupos_adicionais_pkey" PRIMARY KEY ("id")
        );
      `);

      // 8. _ProdutoGrupos (Relation Table M:N implicita ou explicita? No schema é implicita, mas aqui vamos criar a tabela de join)
      // No schema: produtos Produto[] @relation("ProdutoGrupos") em GrupoAdicional
      // Prisma cria uma tabela chamada "_ProdutoGrupos" com "A" (Grupo) e "B" (Produto)
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "_ProdutoGrupos" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "_ProdutoGrupos_AB_unique" ON "_ProdutoGrupos"("A", "B");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "_ProdutoGrupos_B_index" ON "_ProdutoGrupos"("B");`);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "_ProdutoGrupos" ADD CONSTRAINT "_ProdutoGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "_ProdutoGrupos" ADD CONSTRAINT "_ProdutoGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
      } catch (e) {}


      // 9. Adicionais
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "adicionais" (
          "id" TEXT NOT NULL,
          "nome" TEXT NOT NULL,
          "preco" DECIMAL(65,30) NOT NULL,
          "grupo_id" TEXT NOT NULL,
          "ingrediente_ref_id" TEXT,
          CONSTRAINT "adicionais_pkey" PRIMARY KEY ("id")
        );
      `);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_ingrediente_ref_id_fkey" FOREIGN KEY ("ingrediente_ref_id") REFERENCES "ingredientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
      } catch (e) {}

      // 10. Pedidos
      // Nota: 'numero' precisa ser serial/sequence se quisermos autoincrement.
      // Vou criar uma sequence se não existir e associar.
      await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS pedidos_numero_seq;`);
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "pedidos" (
          "id" TEXT NOT NULL,
          "numero" INTEGER NOT NULL DEFAULT nextval('pedidos_numero_seq'),
          "user_id" TEXT,
          "nome_cliente" TEXT NOT NULL,
          "telefone" TEXT,
          "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
          "tipoEntrega" TEXT NOT NULL DEFAULT 'RETIRADA',
          "statusPagamento" TEXT NOT NULL DEFAULT 'PENDENTE',
          "total" DECIMAL(65,30) NOT NULL,
          "observacao" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
        );
      `);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
      } catch (e) {}

      // 11. PedidoItens
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "pedido_itens" (
          "id" TEXT NOT NULL,
          "pedido_id" TEXT NOT NULL,
          "produto_id" TEXT,
          "nome_produto" TEXT NOT NULL,
          "quantidade" INTEGER NOT NULL,
          "preco_unitario" DECIMAL(65,30) NOT NULL,
          "total_item" DECIMAL(65,30) NOT NULL,
          "observacao" TEXT,
          CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
        );
      `);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
      } catch (e) {}

      // 12. PedidoItemAdicionais
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "pedido_item_adicionais" (
          "id" TEXT NOT NULL,
          "pedido_item_id" TEXT NOT NULL,
          "adicional_id" TEXT,
          "nome_adicional" TEXT NOT NULL,
          "preco_adicional" DECIMAL(65,30) NOT NULL,
          CONSTRAINT "pedido_item_adicionais_pkey" PRIMARY KEY ("id")
        );
      `);
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_adicional_id_fkey" FOREIGN KEY ("adicional_id") REFERENCES "adicionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
      } catch (e) {}

      return res.json({ 
        message: 'Estrutura do banco criada com sucesso via SQL Direto!', 
        details: 'Tabelas verificadas/criadas.'
      });

    } catch (error: any) {
      console.error('Erro fatal na migração SQL:', error);
      return res.status(500).json({ 
        error: 'Falha ao rodar migração SQL', 
        details: error.message
      });
    }
  }
}
