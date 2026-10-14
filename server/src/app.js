const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const equipamentoRoutes = require('./routes/equipamentoRoutes');
const manutencaoRoutes = require('./routes/manutencaoRoutes');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Documentação Swagger UI (Diferencial de Maturidade)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/equipamentos', equipamentoRoutes);
app.use('/api/manutencao', manutencaoRoutes);

// Rota de Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), app: 'NetStock API' });
});

// Middleware Centralizado de Tratamento de Erros
app.use(errorHandler);

module.exports = app;