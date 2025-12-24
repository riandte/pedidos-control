-- Enums
CREATE TYPE "StatusPedido" AS ENUM ('RECEBIDO', 'EM_PREPARO', 'PRONTO', 'EM_ROTA', 'ENTREGUE', 'RETIRADO', 'CANCELADO');
CREATE TYPE "TipoEntrega" AS ENUM ('RETIRADA', 'ENTREGA', 'MESA');
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHA', 'ESTORNADO');

-- Tabelas
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

CREATE TABLE "itens" (
    "id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_base" DECIMAL(10,2) NOT NULL,
    "tempo_preparo_min" INTEGER,
    "imagem_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "modificadores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "min_selections" INTEGER NOT NULL DEFAULT 0,
    "max_selections" INTEGER NOT NULL DEFAULT 1,
    "allow_repeated" BOOLEAN NOT NULL DEFAULT false,
    "gratuitos" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modificadores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "item_modificadores" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "modificador_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "item_modificadores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opcoes_modificador" (
    "id" TEXT NOT NULL,
    "modificador_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "opcoes_modificador_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "estoque_atual" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "estoque_minimo" DECIMAL(10,3) NOT NULL DEFAULT 0,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "item_ingredientes" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "ingrediente_id" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "item_ingredientes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero" SERIAL,
    "status" "StatusPedido" NOT NULL DEFAULT 'RECEBIDO',
    "tipo_entrega" "TipoEntrega" NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "cliente_telefone" TEXT NOT NULL,
    "endereco_entrega" JSONB,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxa_entrega" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "pagamento_status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "pagamento_metodo" TEXT,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "item_id" TEXT,
    "nome" TEXT NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "total_item" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pedido_item_opcoes" (
    "id" TEXT NOT NULL,
    "pedido_item_id" TEXT NOT NULL,
    "opcao_modificador_id" TEXT,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_item_opcoes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Indices e Uniques
CREATE UNIQUE INDEX "item_modificadores_item_id_modificador_id_key" ON "item_modificadores"("item_id", "modificador_id");
CREATE UNIQUE INDEX "item_ingredientes_item_id_ingrediente_id_key" ON "item_ingredientes"("item_id", "ingrediente_id");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- Foreign Keys
ALTER TABLE "itens" ADD CONSTRAINT "itens_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "item_modificadores" ADD CONSTRAINT "item_modificadores_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "item_modificadores" ADD CONSTRAINT "item_modificadores_modificador_id_fkey" FOREIGN KEY ("modificador_id") REFERENCES "modificadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "opcoes_modificador" ADD CONSTRAINT "opcoes_modificador_modificador_id_fkey" FOREIGN KEY ("modificador_id") REFERENCES "modificadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "item_ingredientes" ADD CONSTRAINT "item_ingredientes_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "item_ingredientes" ADD CONSTRAINT "item_ingredientes_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "itens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pedido_item_opcoes" ADD CONSTRAINT "pedido_item_opcoes_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pedido_item_opcoes" ADD CONSTRAINT "pedido_item_opcoes_opcao_modificador_id_fkey" FOREIGN KEY ("opcao_modificador_id") REFERENCES "opcoes_modificador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
