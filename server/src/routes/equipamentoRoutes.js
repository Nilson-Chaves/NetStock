const { Router } = require('express');
const equipamentoController = require('../controllers/equipamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @swagger
 * /api/equipamentos:
 *   get:
 *     summary: Listar todos os equipamentos cadastrados
 *     tags: [Equipamentos]
 *     responses:
 *       200:
 *         description: Lista de equipamentos retornada com sucesso
 *   post:
 *     summary: Cadastrar/Tombar novo equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Equipamento criado com sucesso
 */
router.get('/', equipamentoController.listar);
router.post('/', authMiddleware, equipamentoController.criar);

/**
 * @swagger
 * /api/equipamentos/{id}:
 *   get:
 *     summary: Buscar equipamento por ID
 *     tags: [Equipamentos]
 *   put:
 *     summary: Atualizar dados de um equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Remover equipamento do sistema
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', equipamentoController.buscarPorId);
router.put('/:id', authMiddleware, equipamentoController.atualizar);
router.delete('/:id', authMiddleware, equipamentoController.deletar);

module.exports = router;