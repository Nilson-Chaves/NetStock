const { Router } = require('express');
const manutencaoController = require('../controllers/manutencaoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @swagger
 * /api/manutencao:
 *   get:
 *     summary: Listar chamados de manutenção
 *     tags: [Manutenção]
 *   post:
 *     summary: Abrir novo chamado de manutenção
 *     tags: [Manutenção]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', manutencaoController.listar);
router.post('/', authMiddleware, manutencaoController.criar);

/**
 * @swagger
 * /api/manutencao/{id}:
 *   delete:
 *     summary: Encerrar/Remover chamado de manutenção
 *     tags: [Manutenção]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, manutencaoController.deletar);

module.exports = router;