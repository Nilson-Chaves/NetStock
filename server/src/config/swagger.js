const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NetStock API',
      version: '1.0.0',
      description: 'API RESTful para gestão patrimonial e ciclo de vida de ativos de rede',
      contact: {
        name: 'Equipe NetStock',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local de Desenvolvedor',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;