#!/bin/bash
echo "Iniciando o Back-End (Porta 3001) e o Front-End (Porta 5500)..."

# Garante que ambos os servidores sejam encerrados ao apertar Ctrl+C
trap "kill 0" EXIT

# Inicia o Back-End em segundo plano
(cd "$(dirname "$0")/server" && npm run dev) &

# Inicia o Front-End em segundo plano
(cd "$(dirname "$0")" && python3 -m http.server 5500) &

# Aguarda 3 segundos e abre o navegador padrão
sleep 3
xdg-open http://localhost:5500/login.html 2>/dev/null || open http://localhost:5500/login.html 2>/dev/null

# Mantém o terminal aberto exibindo os logs até você apertar Ctrl+C
wait