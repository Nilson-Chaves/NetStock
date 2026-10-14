const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  console.error('[ERRO CENTRALIZADO]:', err);

  // Erro de Validação de Dados (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Falha na validação dos dados de entrada.',
      details: err.errors.map(e => ({ campo: e.path.join('.'), mensagem: e.message }))
    });
  }

  // Erros Conhecidos do Prisma ORM
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflito de unicidade.',
      message: `O valor informado para o campo '${err.meta?.target}' já existe no sistema.`
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Recurso não encontrado no banco de dados.'
    });
  }

  // Erro Genérico / Inesperado (500)
  return res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor. Tente novamente mais tarde.'
  });
}

module.exports = errorHandler;