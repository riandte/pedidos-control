-- CreateTable
CREATE TABLE "users" (
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

-- CreateTable
CREATE TABLE "configuracoes" (
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

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
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

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_ingredientes" (
    "produto_id" TEXT NOT NULL,
    "ingrediente_id" TEXT NOT NULL,

    CONSTRAINT "produto_ingredientes_pkey" PRIMARY KEY ("produto_id","ingrediente_id")
);

-- CreateTable
CREATE TABLE "grupos_adicionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "min_escolhas" INTEGER NOT NULL DEFAULT 0,
    "max_escolhas" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "grupos_adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(65,30) NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "ingrediente_ref_id" TEXT,

    CONSTRAINT "adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "pedido_itens" (
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

-- CreateTable
CREATE TABLE "pedido_item_adicionais" (
    "id" TEXT NOT NULL,
    "pedido_item_id" TEXT NOT NULL,
    "adicional_id" TEXT,
    "nome_adicional" TEXT NOT NULL,
    "preco_adicional" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "pedido_item_adicionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProdutoGrupos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "_ProdutoGrupos_AB_unique" ON "_ProdutoGrupos"("A", "B");

-- CreateIndex
CREATE INDEX "_ProdutoGrupos_B_index" ON "_ProdutoGrupos"("B");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_ingredientes" ADD CONSTRAINT "produto_ingredientes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_ingredientes" ADD CONSTRAINT "produto_ingredientes_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicionais" ADD CONSTRAINT "adicionais_ingrediente_ref_id_fkey" FOREIGN KEY ("ingrediente_ref_id") REFERENCES "ingredientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_adicionais" ADD CONSTRAINT "pedido_item_adicionais_adicional_id_fkey" FOREIGN KEY ("adicional_id") REFERENCES "adicionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdutoGrupos" ADD CONSTRAINT "_ProdutoGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "grupos_adicionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdutoGrupos" ADD CONSTRAINT "_ProdutoGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
