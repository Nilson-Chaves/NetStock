const { z } = require('zod');
const prisma = require('../config/prisma');

const equipamentoSchema = z.object({
  numPatrimonio: z.string().min(1, 'Número do patrimônio é obrigatório'),
  codigo: z.string().min(1, 'Código do equipamento é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo/Categoria é obrigatório'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  precoVenda: z.number().nonnegative('Preço deve ser positivo').optional().default(0),
  status: z.string().optional().default('Ativo'),
  dataTombamento: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  dataBaixa: z.string().nullable().optional()
});

async function listar(req, res, next) {
  try {
    const equipamentos = await prisma.equipamento.findMany({
      orderBy: { createdAt: 'desc' },
      include: { manutencoes: true, historicos: true }
    });
    return res.json(equipamentos);
  } catch (error) {
    next(error);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const equipamento = await prisma.equipamento.findUnique({
      where: { id },
      include: { manutencoes: true, historicos: true }
    });
    if (!equipamento) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }
    return res.json(equipamento);
  } catch (error) {
    next(error);
  }
}

async function criar(req, res, next) {
  try {
    const dados = equipamentoSchema.parse(req.body);

    const novoEquipamento = await prisma.equipamento.create({
      data: dados
    });

    // Registrar no Histórico de Auditoria
    await prisma.historicoMovimentacao.create({
      data: {
        equipamentoId: novoEquipamento.id,
        usuarioId: req.usuario?.id || null,
        titulo: 'Tombamento Realizado',
        descricao: `Equipamento ${novoEquipamento.nome} cadastrado e alocado em ${novoEquipamento.localizacao}.`
      }
    });

    return res.status(201).json(novoEquipamento);
  } catch (error) {
    next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const dados = equipamentoSchema.partial().parse(req.body);

    const equipamentoExistente = await prisma.equipamento.findUnique({ where: { id } });
    if (!equipamentoExistente) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    const atualizado = await prisma.equipamento.update({
      where: { id },
      data: dados
    });

    return res.json(atualizado);
  } catch (error) {
    next(error);
  }
}

async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.equipamento.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };