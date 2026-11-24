const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Registrar um novo usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Nilson Chaves
 *               email:
 *                 type: string
 *                 example: nilson@exemplo.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado
 */
router.post('/registrar', authController.registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário e obter token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: nilson@exemplo.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso (retorna token JWT)
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obter dados do perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/perfil', authController.perfil);

/**
 * @swagger
 * /api/auth/alterar-senha:
 *   put:
 *     summary: Alterar a senha do usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senhaAtual, novaSenha]
 *             properties:
 *               senhaAtual:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta ou dados inválidos
 */
router.put('/alterar-senha', authController.alterarSenha);

/**
 * @swagger
 * /api/auth/usuarios:
 *   get:
 *     summary: Listar todos os usuários cadastrados
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
router.get('/usuarios', authController.listarUsuarios);

/**
 * @swagger
 * /api/auth/usuarios/{id}/permissao:
 *   put:
 *     summary: Atualizar nível de permissão de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Permissão atualizada com sucesso
 */
router.put('/usuarios/:id/permissao', authController.atualizarPermissaoUsuario);

/**
 * @swagger
 * /api/auth/usuarios/{id}:
 *   delete:
 *     summary: Remover um usuário do sistema
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 */
router.delete('/usuarios/:id', authController.deletarUsuario);

module.exports = router;
