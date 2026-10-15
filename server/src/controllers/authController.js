const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { enviarEmailBoasVindas } = require('../services/emailService');

// Schemas de Validação (Zod)
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

// Validação de Política de Senha Forte
function validarForcaSenha(senha, nome) {
  if (!senha || senha.length < 8) {
    return 'A nova senha deve ter no mínimo 8 caracteres.';
  }

  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

  if (!temLetra || !temNumero || !temEspecial) {
    return 'A senha deve conter letras, números e pelo menos um caractere especial (!@#$%...).';
  }

  if (nome && nome.trim().length > 2) {
    const partesNome = nome.toLowerCase().trim().split(' ');
    for (const p of partesNome) {
      if (p.length > 2 && senha.toLowerCase().includes(p)) {
        return 'A senha não pode conter o nome do usuário.';
      }
    }
  }

  return null;
}

// 1. Registro Interno de Usuário (Apenas Administradores)
async function registrar(req, res, next) {
  try {
    const dados = registerSchema.parse(req.body);

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'E-mail já cadastrado no sistema.' });
    }

    const erroSenha = validarForcaSenha(dados.senha, dados.nome);
    if (erroSenha) {
      return res.status(400).json({ error: erroSenha });
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        cargo: dados.cargo || 'Técnico de Rede'
      },
      select: { id: true, nome: true, email: true, cargo: true, createdAt: true }
    });

    // Envio de e-mail com credenciais temporárias
    if (req.body.enviarEmail !== false) {
      enviarEmailBoasVindas(dados.email, dados.nome, dados.senha).catch(err => {
        console.error('Falha ao enviar e-mail em segundo plano:', err);
      });
    }

    return res.status(201).json({ 
      message: 'Novo colaborador cadastrado com sucesso!', 
      usuario: novoUsuario 
    });
  } catch (error) {
    next(error);
  }
}

// 2. Login no Sistema
async function login(req, res, next) {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas (E-mail ou senha incorretos).' });
    }

    if (usuario.status === 'Inativo' || usuario.status === 'Bloqueado') {
      return res.status(403).json({ error: 'Sua conta de acesso está inativa ou bloqueada pela administração.' });
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

// 3. Obter Perfil do Usuário
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

// 4. Alteração de Senha
async function alterarSenha(req, res, next) {
  try {
    const { email, senhaAtual, novaSenha } = req.body;

    if (!email || !senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'E-mail, senha atual e nova senha são obrigatórios.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    }

    const erroForca = validarForcaSenha(novaSenha, usuario.nome);
    if (erroForca) {
      return res.status(400).json({ error: erroForca });
    }

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

// 5. Listar Todos os Usuários da Equipe (Apenas Admins)
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, cargo: true, createdAt: true },
      orderBy: { nome: 'asc' }
    });
    return res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

// 6. Atualizar Cargo ou Permissão do Usuário
async function atualizarPermissaoUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { cargo } = req.body;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: String(id) },
      data: { cargo },
      select: { id: true, nome: true, email: true, cargo: true }
    });

    return res.json({ message: 'Permissão atualizada com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    next(error);
  }
}

// 7. Excluir Usuário permanentemente (Apenas Administradores)
async function deletarUsuario(req, res, next) {
  try {
    const { id } = req.params;

    if (req.usuario && req.usuario.id === id) {
      return res.status(400).json({ error: 'Você não pode excluir a sua própria conta de administrador.' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { id: String(id) } });
    if (!usuarioExiste) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
    }

    await prisma.usuario.delete({
      where: { id: String(id) }
    });

    return res.status(200).json({ message: 'Usuário excluído com sucesso do banco de dados.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registrar,
  login,
  perfil,
  alterarSenha,
  listarUsuarios,
  atualizarPermissaoUsuario,
  deletarUsuario
};