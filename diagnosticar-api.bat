@echo off
echo Ferramenta de diagnóstico da API Pagar.me
echo ---------------------------------------
echo.

echo Verificando se o servidor Netlify está rodando...
netstat -ano | findstr :8888 > nul
if %errorlevel% equ 0 (
  echo [OK] Servidor Netlify Functions detectado na porta 8888
) else (
  echo [ERRO] Servidor Netlify Functions não encontrado na porta 8888
  echo Iniciando o servidor...
  start cmd /c "npx netlify dev -p 8888"
  timeout /t 5
)

echo.
echo Verificando ambiente e variáveis...
echo.
echo Arquivo .env.local:
if exist .env.local (
  echo [OK] Arquivo .env.local encontrado
  findstr /C:"PAGARME_API_KEY" .env.local > nul
  if %errorlevel% equ 0 (
    echo [OK] PAGARME_API_KEY encontrada
  ) else (
    echo [ERRO] PAGARME_API_KEY não encontrada
  )
  
  findstr /C:"VITE_PAGARME_PUBLIC_KEY" .env.local > nul
  if %errorlevel% equ 0 (
    echo [OK] VITE_PAGARME_PUBLIC_KEY encontrada
  ) else (
    echo [ERRO] VITE_PAGARME_PUBLIC_KEY não encontrada
  )
) else (
  echo [ERRO] Arquivo .env.local não encontrado
)

echo.
echo Acessando diagnóstico da API...
echo.
curl -s http://localhost:8888/.netlify/functions/diagnose > diagnostico.json
echo Resultado salvo em diagnostico.json

echo.
echo Diagnóstico concluído!
echo Para iniciar o servidor com as variáveis de ambiente use:
echo   iniciar-dev.bat
echo.
pause 