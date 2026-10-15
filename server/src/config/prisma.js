const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

// Evita acumular múltiplas conexões em ambiente de desenvolvimento (nodemon)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handler para reconectar automaticamente no Neon em caso de queda por ociosidade
prisma.$connect()
  .catch((err) => {
    console.warn('⚠️ Alerta de conexão Prisma/Neon:', err.message);
  });

module.exports = prisma;