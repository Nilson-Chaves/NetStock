const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  cargo: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha')
});

async function registrar(req, res, next) {
  try {
    const dados = registerSchema.parse(req.body);

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        cargo: dados.cargo || 'Administrador'
      },
      select: { id: true, nome: true, email: true, cargo: true, createdAt: true }
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso', usuario: novoUsuario });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas (E-mail ou senha incorretos).' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas (E-mail ou senha incorretos).' });
    }

    const secret = process.env.JWT_SECRET || 'netstock_super_secreto_jwt_key_2026_@key';
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo }
    });
  } catch (error) {
    next(error);
  }
}

async function perfil(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, cargo: true, createdAt: true }
    });
    return res.json(usuario);
  } catch (error) {
    next(error);
  }
}

module.exports = { registrar, login, perfil };