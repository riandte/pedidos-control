-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CLIENTE',
    "endereco" TEXT,
    "telefone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoria_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_base" DECIMAL NOT NULL,
    "tempo_preparo_min" INTEGER,
    "imagem_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "permite_adicionais" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "produto_ingredientes" (
    "produto_id" TEXT NOT NULL,
    "ingrediente_id" TEXT NOT NULL,

    PRIMARY KEY ("produto_id", "ingrediente_id"),
    CONSTRAINT "produto_ingredientes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "produto_ingredientes_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grupos_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "min_escolhas" INTEGER NOT NULL DEFAULT 0,
    "max_escolhas" INTEGER NOT NULL DEFAULT 1,
    "produto_id" TEXT NOT NULL,
    CONSTRAINT "grupos_adicionais_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "ingrediente_ref_id" TEXT,
    CONSTRAINT "adicionais_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos_adicionais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "adicionais_ingrediente_ref_id_fkey" FOREIGN KEY ("ingrediente_ref_id") REFERENCES "ingredientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "user_id" TEXT,
    "nome_cliente" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
    "tipoEntrega" TEXT NOT NULL DEFAULT 'RETIRADA',
    "statusPagamento" TEXT NOT NULL DEFAULT 'PENDENTE',
    "total" DECIMAL NOT NULL,
    "observacao" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pedidos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedido_id" TEXT NOT NULL,
    "produto_id" TEXT,
    "nome_produto" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL NOT NULL,
    "total_item" DECIMAL NOT NULL,
    "observacao" TEXT,
    CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pedido_item_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedido_item_id" TEXT NOT NULL,
    "adicional_id" TEXT,
    "nome_adicional" TEXT NOT NULL,
    "preco_adicional" DECIMAL NOT NULL,
    CONSTRAINT "pedido_item_adicionais_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pedido_item_adicionais_adicional_id_fkey" FOREIGN KEY ("adicional_id") REFERENCES "adicionais" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");
