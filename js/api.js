/* ==========================================================================
   NETSTOCK API INTERFACE - INTEGRAÇÃO FULL-STACK EXPRESS/POSTGRES
   ========================================================================== */

const API_BASE_URL = 'http://localhost:3001/api';

// Obter token JWT salvo no navegador
function obterToken() {
  return localStorage.getItem('netstock_token');
}

// Salvar token JWT
function salvarToken(token) {
  localStorage.setItem('netstock_token', token);
}

// Remover token (Logout)
function removerToken() {
  localStorage.removeItem('netstock_token');
}

// Cabeçalhos padrão para requisições
function obterHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = obterToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Manipulador genérico de respostas e tratamento de erros de rede
async function tratarResposta(resposta) {
  if (!resposta.ok) {
    if (resposta.status === 401) {
      console.warn('Sessão expirada ou não autorizada. Redirecionando para login...');
      // Tratar renovação ou aviso ao usuário se necessário
    }
    const erroJson = await resposta.json().catch(() => ({}));
    const mensagem = erroJson.error || erroJson.message || `Erro de Comunicação com a API (${resposta.status})`;
    throw new Error(mensagem);
  }
  if (resposta.status === 204) return true;
  return await resposta.json();
}

/* --- MÓDULO DE AUTENTICAÇÃO --- */
async function realizarLogin(email, senha) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const dados = await tratarResposta(res);
  if (dados.token) salvarToken(dados.token);
  return dados;
}

async function cadastrarUsuario(nome, email, senha, cargo) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, cargo }),
  });
  return await tratarResposta(res);
}

/* --- MÓDULO DE EQUIPAMENTOS / ATIVOS --- */
async function obterTodosEquipamentos() {
  const res = await fetch(`${API_BASE_URL}/equipamentos`, {
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

async function buscarEquipamentoPorId(id) {
  const res = await fetch(`${API_BASE_URL}/equipamentos/${id}`, {
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

async function criarEquipamento(dados) {
  const res = await fetch(`${API_BASE_URL}/equipamentos`, {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados),
  });
  return await tratarResposta(res);
}

async function atualizarEquipamento(id, dados) {
  const res = await fetch(`${API_BASE_URL}/equipamentos/${id}`, {
    method: 'PUT',
    headers: obterHeaders(),
    body: JSON.stringify(dados),
  });
  return await tratarResposta(res);
}

async function deletarEquipamento(id) {
  const res = await fetch(`${API_BASE_URL}/equipamentos/${id}`, {
    method: 'DELETE',
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

/* --- MÓDULO DE MANUTENÇÃO --- */
async function obterChamadosManutencao() {
  const res = await fetch(`${API_BASE_URL}/manutencao`, {
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

async function criarChamadoManutencao(dados) {
  const res = await fetch(`${API_BASE_URL}/manutencao`, {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados),
  });
  return await tratarResposta(res);
}

async function deletarChamadoManutencao(id) {
  const res = await fetch(`${API_BASE_URL}/manutencao/${id}`, {
    method: 'DELETE',
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

// Fallback genérico para manter compatibilidade com funções antigas
async function buscarRecurso(recurso) {
  if (recurso === 'manutencao') return await obterChamadosManutencao();
  if (recurso === 'equipamentos') return await obterTodosEquipamentos();
  return [];
}