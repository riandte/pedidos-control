# Estrutura de Diretórios do Projeto

Este arquivo reflete a estrutura atual do projeto monorepo "pedidos-control", configurado para deploy serverless na Vercel com banco de dados Supabase.

```
pedidos-control/
├── backend/                  # API Node.js + Express + Prisma
│   ├── api/
│   │   └── index.ts          # Entrypoint para Vercel Serverless Function
│   ├── prisma/
│   │   ├── migrations/       # Histórico de migrações do banco
│   │   ├── schema.prisma     # Schema do banco de dados (PostgreSQL)
│   │   └── seed.ts           # Script de população inicial (dev)
│   ├── src/
│   │   ├── @types/           # Definições de tipos TypeScript
│   │   ├── config/           # Configurações gerais
│   │   ├── controllers/      # Controladores da API
│   │   ├── middlewares/      # Middlewares (Auth, Validation, Error)
│   │   ├── routes/           # Rotas da API
│   │   ├── services/         # Regras de negócio
│   │   ├── app.ts            # Configuração do Express
│   │   └── server.ts         # Entrypoint para servidor local (long-running)
│   ├── .env                  # Variáveis de ambiente (Local)
│   ├── .env.production       # Modelo de variáveis de ambiente (Produção)
│   ├── package.json          # Dependências e Scripts (inclui vercel-build)
│   ├── tsconfig.json         # Configuração TypeScript
│   └── vercel.json           # Configuração de Deploy da Vercel (Backend)
│
├── frontend/                 # Aplicação React + Vite
│   ├── src/
│   │   ├── assets/           # Imagens e Estilos globais
│   │   ├── components/       # Componentes Reutilizáveis (UI, Cart, etc)
│   │   ├── contexts/         # Context API (CartProvider, Auth)
│   │   ├── layouts/          # Layouts de Página (Admin, Client)
│   │   ├── pages/            # Telas do Sistema
│   │   │   ├── admin/        # Área Administrativa
│   │   │   └── client/       # Cardápio Digital (Cliente)
│   │   ├── services/         # Integração com API (Axios)
│   │   ├── types/            # Tipos TypeScript Compartilhados
│   │   ├── App.tsx           # Componente Raiz
│   │   └── main.tsx          # Entrypoint React
│   ├── package.json          # Dependências e Scripts
│   ├── tsconfig.json         # Configuração TypeScript
│   ├── vercel.json           # Configuração de Rotas SPA para Vercel
│   └── vite.config.ts        # Configuração do Vite
│
├── database/                 # Scripts SQL manuais (se houver)
├── deploy_setup.ps1          # Script de Automação de Setup Local
├── DOCUMENTACAO_DO_SISTEMA.md # Documentação funcional
├── ESTRUTURA_DO_PROJETO.md   # Este arquivo
├── GUIA_DE_DEPLOY.md         # Guia Geral de Deploy
├── GUIA_DEPLOY_SERVERLESS.md # Guia Específico para Serverless/Vercel
├── README_DEPLOY.txt         # Resumo rápido de deploy
├── .gitignore                # Arquivos ignorados pelo Git
└── docker-compose.yml        # Configuração Docker (Opcional/Dev)
```
