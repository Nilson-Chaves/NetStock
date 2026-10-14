require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor NetStock rodando com sucesso na porta ${PORT}`);
  console.log(`📑 Documentação Swagger interativa disponível em http://localhost:${PORT}/api-docs`);
});