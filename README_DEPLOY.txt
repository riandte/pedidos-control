# Guia de Deploy Rápido - Pedidos Control

Este arquivo contém os passos para subir o sistema para produção.

## Pré-requisitos
1. Ter o **Node.js** instalado.
2. Ter o **Vercel CLI** instalado: `npm i -g vercel`
3. Ter uma conta no **Supabase** e a Connection String (PostgreSQL).

## Passo 1: Preparação Automática
Execute o script `deploy_setup.ps1` no PowerShell. Ele irá:
- Instalar dependências.
- Configurar o banco de dados (Migrate + Seed).
- Verificar se o build está funcionando.
- Fornecer os comandos finais.

```powershell
./deploy_setup.ps1
```

## Passo 2: Deploy na Vercel (Manual)
O script acima irá gerar os comandos exatos, mas aqui está o resumo do que deve ser feito:

1. **Login:**
   `vercel login`

2. **Backend:**
   Entre na pasta `backend` e rode:
   ```bash
   vercel --prod --env DATABASE_URL="sua_string_supabase" --env JWT_SECRET="segredo_seguro" --env NODE_ENV="production" --env CORS_ORIGIN="*"
   ```
   *Nota: Após o deploy do frontend, atualize o CORS_ORIGIN com a URL do frontend.*

3. **Frontend:**
   Entre na pasta `frontend` e rode:
   ```bash
   vercel --prod --env VITE_API_URL="https://url-do-seu-backend.vercel.app/api"
   ```

## Passo 3: Finalização
1. Pegue a URL do Frontend gerada pela Vercel.
2. Volte no deploy do Backend e atualize a variável `CORS_ORIGIN` com essa URL.
3. Redeploy o backend se necessário (geralmente atualizar a env já basta, ou `vercel --prod` de novo).

## Status do Sistema
- **Frontend**: Aguardando Deploy (Vercel)
- **Backend**: Aguardando Deploy (Vercel)
- **Banco de Dados**: Configurado via Prisma (Aguardando execução do script)
