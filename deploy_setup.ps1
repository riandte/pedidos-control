# Script de Preparação e Deploy Automático (Simulado)
# Este script prepara o ambiente, instala dependências, compila e fornece os comandos finais para o deploy.

Write-Host ">>> Iniciando Preparação para Deploy..." -ForegroundColor Green

# 1. Configuração do Banco de Dados
$supabaseUrl = Read-Host "Insira sua Connection String do Supabase (postgresql://...)"
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    Write-Error "Connection String é obrigatória!"
    exit 1
}

# Definir variável de ambiente para o processo atual
$env:DATABASE_URL = $supabaseUrl

# 2. Backend Setup
Write-Host "`n>>> Configurando Backend..." -ForegroundColor Cyan
Set-Location "backend"

Write-Host "Instalando dependências do backend..."
npm install

Write-Host "Gerando Prisma Client..."
npx prisma generate

Write-Host "Rodando Migrações no Supabase..."
# Tenta rodar a migração. Se falhar, o usuário será alertado.
try {
    npx prisma migrate deploy
    Write-Host "Migrações aplicadas com sucesso!" -ForegroundColor Green
} catch {
    Write-Error "Falha ao aplicar migrações. Verifique a string de conexão."
    exit 1
}

Write-Host "Rodando Seed do Banco de Dados..."
try {
    npx prisma db seed
    Write-Host "Seed concluído!" -ForegroundColor Green
} catch {
    Write-Warning "Falha no Seed. Pode ser que os dados já existam."
}

Write-Host "Compilando Backend..."
npm run build

# 3. Frontend Setup
Write-Host "`n>>> Configurando Frontend..." -ForegroundColor Cyan
Set-Location "../frontend"

Write-Host "Instalando dependências do frontend..."
npm install

Write-Host "Compilando Frontend (Teste de Build)..."
# Para o build de produção real, precisaremos da URL do backend.
# Como ainda não temos a URL do backend deployado, vamos buildar com uma variável placeholder para teste
# ou pedir para o usuário fornecer se ele já tiver.
$backendUrl = "https://seu-backend-na-vercel.vercel.app/api" 
$env:VITE_API_URL = $backendUrl
npm run build

# 4. Instruções de Deploy na Vercel
Write-Host "`n>>> Preparação Local Concluída!" -ForegroundColor Green
Write-Host "Agora, execute os seguintes comandos para subir para a Vercel:" -ForegroundColor Yellow

Write-Host "`n# 1. Login na Vercel (se não estiver logado)"
Write-Host "vercel login"

Write-Host "`n# 2. Deploy do Backend"
Write-Host "cd backend"
Write-Host "vercel --prod --env DATABASE_URL=`"$supabaseUrl`" --env JWT_SECRET=`"$(New-Guid)`" --env NODE_ENV=`"production`" --env CORS_ORIGIN=`"https://seu-frontend-na-vercel.vercel.app`""

Write-Host "`n# 3. Deploy do Frontend"
Write-Host "cd ../frontend"
Write-Host "vercel --prod --env VITE_API_URL=`"https://URL_DO_SEU_BACKEND_AQUI/api`""

Write-Host "`n>>> FIM DO SCRIPT <<<"
