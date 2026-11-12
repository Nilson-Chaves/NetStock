@echo off
title NetStock - Iniciando Servidores
echo Iniciando o Back-End (Porta 3001) e o Front-End (Porta 5500)...

start "NetStock API (3001)" cmd /k "cd /d %~dp0server && npm run dev"
start "NetStock Front-End (5500)" cmd /k "cd /d %~dp0 && python -m http.server 5500"

timeout /t 3 /nobreak >nul
start http://localhost:5500/login.html
