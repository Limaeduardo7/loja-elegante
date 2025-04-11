@echo off
echo Limpando cache e reiniciando o ambiente...

rem Parar quaisquer processos do Vite em execução
taskkill /f /im node.exe 2>nul

rem Remover diretórios de cache
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q dist 2>nul

rem Reconstruir o projeto
echo Executando a aplicação em modo de desenvolvimento...
npm run dev

echo Concluído! 