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

// Função auxiliar de validação estrita de política de senha
function validarForcaSenha(senha, nome, dataNasc) {
  if (!senha || senha.length < 8) {
    return 'A nova senha deve ter no mínimo 8 caracteres.';
  }

  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

  if (!temLetra || !temNumero || !temEspecial) {
    return 'A nova senha deve conter letras, números e pelo menos um caractere especial (!@#$%...).';
  }

  if (nome && nome.trim().length > 2) {
    const partesNome = nome.toLowerCase().trim().split(' ');
    for (const p of partesNome) {
      if (p.length > 2 && senha.toLowerCase().includes(p)) {
        return 'A nova senha não pode conter seu nome ou partes dele.';
      }
    }
  }

  if (dataNasc) {
    const dataStr = String(dataNasc);
    const partes = dataStr.includes('-') ? dataStr.split('-') : (dataStr.includes('/') ? dataStr.split('/') : []);
    for (const p of partes) {
      if (p && p.length >= 2 && senha.includes(p)) {
        return 'A nova senha não pode conter seu dia, mês ou ano de nascimento.';
      }
    }
  }

  return null; // Senha aprovada
}

// 1. Registro de Usuários
async function registrar(req, res, next) {
  try {
    const dados = registerSchema.parse(req.body);

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const erroSenha = validarForcaSenha(dados.senha, dados.nome, req.body.dataNascimento);
    if (erroSenha) {
      return res.status(400).json({ error: erroSenha });
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

// 2. Login
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

// 3. Perfil do Usuário Logado
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

// 4. Alteração Rígida de Senha com Validação de Hash e Política Estrita de Segurança
async function alterarSenha(req, res, next) {
  try {
    const { email, senhaAtual, novaSenha } = req.body;

    if (!email || !senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'E-mail, senha atual e nova senha são obrigatórios.' });
    }

    // Busca o usuário no banco PostgreSQL
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Valida se a Senha Atual bate com o Hash
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    }

    // Aplica a Política Estrita de Segurança à Nova Senha
    const erroForca = validarForcaSenha(novaSenha, usuario.nome, usuario.dataNascimento);
    if (erroForca) {
      return res.status(400).json({ error: erroForca });
    }

    // Criptografa a Nova Senha e salva no PostgreSQL
    const novohash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { email },
      data: { senha: novohash }
    });

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registrar,
  login,
  perfil,
  alterarSenha
};