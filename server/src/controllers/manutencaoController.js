const { z } = require('zod');
const prisma = require('../config/prisma');

const manutencaoSchema = z.object({
  equipamentoId: z.string().optional().nullable(),
  nomeEquipamento: z.string().min(1, 'Nome do equipamento é obrigatório'),
  descricao: z.string().min(1, 'Descrição do problema é obrigatória'),
  status: z.string().optional().default('Alta prioridade'),
  tipoStatus: z.string().optional().default('alta'),
  icone: z.string().optional().default('!')
});

async function listar(req, res, next) {
  try {
    const manutencoes = await prisma.manutencao.findMany({
      orderBy: { createdAt: 'desc' },
      include: { equipamento: true }
    });
    return res.json(manutencoes);
  } catch (error) {
    next(error);
  }
}

async function criar(req, res, next) {
  try {
    const dados = manutencaoSchema.parse(req.body);
    const novoChamado = await prisma.manutencao.create({ data: dados });
    return res.status(201).json(novoChamado);
  } catch (error) {
    next(error);
  }
}

async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.manutencao.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, criar, deletar };