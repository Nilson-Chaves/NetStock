require('dotenv').config();
const os = require('os');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

// Função para descobrir automaticamente o IP IPv4 local da máquina
function obterIpLocal() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ipLocal = obterIpLocal();
  console.log(`\n🚀 Servidor NetStock rodando com sucesso!`);
  console.log(`👉 Acesso Local:          http://localhost:${PORT}`);
  console.log(`👉 Acesso na Rede (IP):   http://${ipLocal}:${PORT}`);
  console.log(`📑 Documentação Swagger: http://localhost:${PORT}/api-docs\n`);
});