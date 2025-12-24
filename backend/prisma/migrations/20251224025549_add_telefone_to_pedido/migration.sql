/*
  Warnings:

  - You are about to drop the column `produto_id` on the `grupos_adicionais` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "telefone" TEXT;

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "nome_loja" TEXT NOT NULL DEFAULT 'Minha Loja',
    "endereco" TEXT NOT NULL DEFAULT '',
    "horario" TEXT NOT NULL DEFAULT '08:00 às 18:00',
    "mensagem" TEXT,
    "aberto" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ProdutoGrupos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProdutoGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "grupos_adicionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProdutoGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "ingrediente_ref_id" TEXT,
    CONSTRAINT "adicionais_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos_adicionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "adicionais_ingrediente_ref_id_fkey" FOREIGN KEY ("ingrediente_ref_id") REFERENCES "ingredientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_adicionais" ("grupo_id", "id", "ingrediente_ref_id", "nome", "preco") SELECT "grupo_id", "id", "ingrediente_ref_id", "nome", "preco" FROM "adicionais";
DROP TABLE "adicionais";
ALTER TABLE "new_adicionais" RENAME TO "adicionais";
CREATE TABLE "new_grupos_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "min_escolhas" INTEGER NOT NULL DEFAULT 0,
    "max_escolhas" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_grupos_adicionais" ("id", "max_escolhas", "min_escolhas", "nome") SELECT "id", "max_escolhas", "min_escolhas", "nome" FROM "grupos_adicionais";
DROP TABLE "grupos_adicionais";
ALTER TABLE "new_grupos_adicionais" RENAME TO "grupos_adicionais";
CREATE TABLE "new_ingredientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_ingredientes" ("created_at", "id", "nome", "updated_at") SELECT "created_at", "id", "nome", "updated_at" FROM "ingredientes";
DROP TABLE "ingredientes";
ALTER TABLE "new_ingredientes" RENAME TO "ingredientes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ProdutoGrupos_AB_unique" ON "_ProdutoGrupos"("A", "B");

-- CreateIndex
CREATE INDEX "_ProdutoGrupos_B_index" ON "_ProdutoGrupos"("B");
