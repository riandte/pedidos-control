# 🚀 GUIA DE DEPLOY: SISTEMA DE PEDIDOS (SERVERLESS + MONOREPO)

Este guia cobre o deploy completo do seu monorepo na Vercel (Frontend e Backend separados) com banco PostgreSQL no Supabase, seguindo **estritamente** suas restrições de rede e segurança.

---

## ⚠️ PREPARAÇÃO INICIAL (GitHub)

1. **Crie um repositório no GitHub** (se ainda não existir).
2. **Suba seu código:**
   Abra o terminal na pasta raiz `pedidos-control` e execute:
   ```bash
   git init
   git add .
   git commit -m "Setup inicial monorepo"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

---

## 1. BANCO DE DADOS (Supabase)

Você já tem a connection string. Apenas garanta que ela está salva em local seguro.
*Exemplo:* `postgresql://postgres:SUA_SENHA@db.host.supabase.co:5432/postgres`

---

## 2. DEPLOY DO BACKEND (Vercel)

Vamos criar um projeto na Vercel que aponta **apenas** para a pasta `backend`.

1. Acesse [vercel.com/new](https://vercel.com/new).
2. **Importe** o seu repositório do GitHub.
3. Na tela de configuração ("Configure Project"):
   - **Project Name:** `pedidos-backend` (ou o que preferir).
   - **Root Directory:** Clique em `Edit` e selecione a pasta `backend`. **Isso é crucial!**
   - **Framework Preset:** Deixe como `Other` ou `Node.js` (ele deve detectar automático).
   - **Build Command:** `npm run vercel-build` (Configuramos isso no package.json para rodar as migrações).
   - **Environment Variables** (Adicione estas):
     - `DATABASE_URL` = `sua_string_do_supabase`
     - `JWT_SECRET` = `crie_uma_senha_forte_e_aleatoria`
     - `NODE_ENV` = `production`
     - `CORS_ORIGIN` = `*` (Mudaremos isso depois para a URL do frontend)

4. Clique em **Deploy**.

### 🔍 O que vai acontecer?
- A Vercel vai baixar a pasta `backend`.
- Vai rodar `npm install`.
- Vai rodar `npm run vercel-build`, que executa:
  1. `prisma generate` (Gera o cliente do banco).
  2. `prisma migrate deploy` (Aplica as tabelas no Supabase **direto da Vercel**, contornando seu bloqueio local).
  3. `tsc` (Compila o TypeScript).
- Se tudo der certo, você verá a tela de "Congratulations!".
- **Copie a URL do seu backend** (ex: `https://pedidos-backend.vercel.app`).

---

## 3. DEPLOY DO FRONTEND (Vercel)

Agora vamos criar outro projeto para o Frontend.

1. Volte para o Dashboard da Vercel e clique em **Add New... > Project**.
2. **Importe o MESMO repositório** do GitHub novamente.
3. Na tela de configuração:
   - **Project Name:** `pedidos-frontend`.
   - **Root Directory:** Clique em `Edit` e selecione a pasta `frontend`.
   - **Framework Preset:** `Vite` (Deve detectar automaticamente).
   - **Environment Variables**:
     - `VITE_API_URL` = `https://pedidos-backend.vercel.app/api` (A URL do passo anterior + `/api`).
     *Nota: Não esqueça do `/api` no final!*

4. Clique em **Deploy**.

---

## 4. FECHANDO O CICLO (Segurança CORS)

Agora que o frontend existe, vamos proteger o backend.

1. Pegue a URL final do seu frontend (ex: `https://pedidos-frontend.vercel.app`).
2. Vá no painel da Vercel do projeto **pedidos-backend**.
3. Vá em **Settings > Environment Variables**.
4. Edite a variável `CORS_ORIGIN` e coloque a URL do frontend (sem a barra `/` no final).
5. Vá na aba **Deployments**, clique nos três pontinhos do último deploy e selecione **Redeploy** para aplicar a nova variável.

---

## ✅ RESUMO TÉCNICO

1. **Migrações:** Ocorrem automaticamente a cada deploy do backend (`prisma migrate deploy`). Nunca rode localmente.
2. **Seeds:** Não rodarão automaticamente. Para criar o usuário admin inicial, você precisará conectar no banco via algum cliente SQL (se sua rede permitir) ou criar uma rota temporária no backend para rodar o seed (não recomendado deixar exposto).
   *Alternativa segura:* Use o **SQL Editor** no painel do Supabase para inserir o primeiro usuário admin manualmente:
   ```sql
   INSERT INTO users (id, nome, email, senha, tipo, "created_at", "updated_at")
   VALUES (gen_random_uuid(), 'Admin', 'admin@admin.com', 'hash_da_senha_aqui', 'ADMIN', now(), now());
   ```

3. **CI/CD:** Qualquer push na branch `main` do GitHub disparará deploys automáticos na Vercel.

---

## 🛠 SOLUÇÃO DE PROBLEMAS

- **Erro de Conexão no Build:** Se o deploy do backend falhar na etapa de migrate, verifique se a Connection String no `DATABASE_URL` está correta e se a opção "Transaction Mode" está ativa no Supabase (porta 6543) ou Session Mode (porta 5432). Para serverless, recomenda-se usar o **Supabase Connection Pooler** (porta 6543) com `pgbouncer=true` na query string, mas a porta 5432 padrão costuma funcionar bem para baixo tráfego.

- **Frontend não carrega dados:** Abra o Console do navegador (F12). Se der erro de CORS, verifique se a variável `CORS_ORIGIN` no backend está EXATAMENTE igual à URL do frontend (https://...).
