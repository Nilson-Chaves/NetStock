const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Autenticação]
 */
router.post('/register', authController.registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário e obter JWT Token
 *     tags: [Autenticação]
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authMiddleware, authController.perfil);

module.exports = router;