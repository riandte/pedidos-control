# Guia Completo de Deploy Automático (Serverless & Monorepo)

Este guia cobre o deploy completo do sistema **Pedidos Control** usando **Supabase** (Banco), **Vercel** (Frontend e Backend Serverless) e **GitHub** (Monorepo).

---

## 1. Banco de Dados (Supabase)

1. **Criar Projeto**:
   - Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
   - Escolha uma senha forte para o banco (ex: `MinhaSenhaForte123!`).

2. **Obter Connection String**:
   - Vá em **Project Settings > Database > Connection String**.
   - Aba **Nodejs**, copie a string. Ela será sua `DATABASE_URL`.
   - Exemplo: `postgresql://postgres.user:pass@host:5432/postgres`

3. **Configurar Prisma (Local)**:
   - No arquivo `backend/prisma/schema.prisma`, certifique-se que está assim:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - No terminal (dentro de `backend/`), rode as migrações apontando para o Supabase:
     ```bash
     # Linux/Mac
     export DATABASE_URL="sua_string_do_supabase"
     npx prisma migrate deploy
     npx prisma db seed

     # Windows (PowerShell)
     $env:DATABASE_URL="sua_string_do_supabase"
     npx prisma migrate deploy
     npx prisma db seed
     ```

---

## 2. Backend (Vercel Serverless)

O backend foi adaptado para rodar como Serverless Function na Vercel.

### Passo a Passo no Vercel
1. Crie um novo projeto na Vercel ("Add New > Project").
2. Importe seu repositório do GitHub.
3. **Configurações do Projeto**:
   - **Root Directory**: `backend` (Clique em "Edit" ao lado de Root Directory e selecione a pasta `backend`).
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `DATABASE_URL`: A string do Supabase.
   - `JWT_SECRET`: Uma chave aleatória (ex: `xyz123abc`).
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: A URL do seu frontend (ex: `https://meu-lanche.vercel.app`). *Se não souber ainda, coloque `*` e mude depois.*
5. Clique em **Deploy**.

**Nota**: O arquivo `vercel.json` e a exportação do `app` no `server.ts` já estão configurados no código.

---

## 3. Frontend (React/Vite)

1. Volte ao Dashboard da Vercel e crie **outro** projeto ("Add New > Project").
2. Importe o **mesmo** repositório do GitHub.
3. **Configurações do Projeto**:
   - **Root Directory**: `frontend` (Selecione a pasta `frontend`).
   - **Framework Preset**: `Vite` (A Vercel deve detectar automaticamente).
4. **Environment Variables**:
   - `VITE_API_URL`: A URL do seu backend que acabou de ser criado (ex: `https://meu-backend.vercel.app/api`).
     *Importante: Adicione `/api` no final se sua rota base for essa.*
5. Clique em **Deploy**.

---

## 4. Integração Final e Testes

1. **Atualizar CORS**:
   - Pegue a URL final do Frontend (ex: `https://pedidos-front.vercel.app`).
   - Vá no projeto do **Backend** na Vercel > Settings > Environment Variables.
   - Edite a variável `CORS_ORIGIN` com essa URL (sem barra no final).
   - Vá em "Deployments" e clique em "Redeploy" no último deploy para aplicar a mudança.

2. **Checklist Pós-Deploy**:
   - [ ] Acessar Frontend: Cardápio carrega categorias e produtos?
   - [ ] Login Admin: Consigo logar em `/admin`?
   - [ ] Novo Pedido: Criar um pedido no cliente e ver se aparece no Admin e KDS.
   - [ ] Banco de Dados: Verificar no Supabase (Table Editor) se o pedido foi criado.

---

## 5. Estrutura do Repositório (Monorepo)

```
/
├── backend/            # Projeto Node.js (Vercel Project 1)
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json     # Configuração Serverless
├── frontend/           # Projeto React (Vercel Project 2)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── database/           # Scripts SQL (se houver)
├── GUIA_DE_DEPLOY.md   # Este arquivo
└── README.md
```

### Comandos Úteis

**Backend (Local)**:
```bash
cd backend
npm install
npm run dev
```

**Frontend (Local)**:
```bash
cd frontend
npm install
npm run dev
```
