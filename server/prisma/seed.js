const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Povoando banco de dados com equipamentos iniciais...');

  await prisma.equipamento.deleteMany({});

  await prisma.equipamento.createMany({
    data: [
      {
        numPatrimonio: 'PAT-2026-001',
        codigo: 'SW-CORE-01',
        nome: 'Switch Core Cisco Catalyst 9300',
        tipo: 'Switch',
        localizacao: 'Data Center - Rack A1',
        responsavel: 'João Silva',
        precoVenda: 15400.00,
        status: 'Ativo',
        dataTombamento: '2026-01-15'
      },
      {
        numPatrimonio: 'PAT-2026-002',
        codigo: 'RT-EDGE-01',
        nome: 'Roteador Mikrotik CCR2004',
        tipo: 'Roteador',
        localizacao: 'POP Central - Rack B2',
        responsavel: 'Maria Souza',
        precoVenda: 4800.00,
        status: 'Ativo',
        dataTombamento: '2026-02-10'
      },
      {
        numPatrimonio: 'PAT-2026-003',
        codigo: 'FW-FORTI-01',
        nome: 'Firewall Fortinet FortiGate 60F',
        tipo: 'Firewall',
        localizacao: 'Sede - Sala Técnica',
        responsavel: 'Carlos Lima',
        precoVenda: 8900.00,
        status: 'Em Manutenção',
        dataTombamento: '2026-03-01'
      }
    ]
  });

  console.log('✅ Equipamentos inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });