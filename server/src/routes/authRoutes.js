const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.get('/perfil', authController.perfil);
router.put('/alterar-senha', authController.alterarSenha);

// Rotas de Gestão de Equipe e Permissões
router.get('/usuarios', authController.listarUsuarios);
router.put('/usuarios/:id/permissao', authController.atualizarPermissaoUsuario);
router.delete('/usuarios/:id', authController.deletarUsuario);

module.exports = router;