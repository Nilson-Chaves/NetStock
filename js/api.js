// Pega o IP/hostname atual da máquina na rede dinamicamente
const API_URL = `http://${window.location.hostname}:3000`;

/**
 * GET - Buscar dados na API
 */
export async function buscarRecurso(recurso) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}`);
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} ao buscar ${recurso}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API GET - ${recurso}]:`, erro);
    throw erro;
  }
}

/**
 * POST - Criar novo recurso
 */
export async function criarRecurso(recurso, dados) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} ao criar ${recurso}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API POST - ${recurso}]:`, erro);
    throw erro;
  }
}

/**
 * PUT / PATCH - Atualizar recurso existente (Cobre o requisito de atualização!)
 */
export async function atualizarRecurso(recurso, id, dadosParciaisOuCompletos, parcial = true) {
  try {
    const metodo = parcial ? 'PATCH' : 'PUT';
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParciaisOuCompletos)
    });
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} ao atualizar ${recurso}/${id}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API ${parcial ? 'PATCH' : 'PUT'} - ${recurso}/${id}]:`, erro);
    throw erro;
  }
}

/**
 * DELETE - Excluir recurso
 */
export async function deletarRecurso(recurso, id) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: 'DELETE'
    });
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} ao deletar ${recurso}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API DELETE - ${recurso}/${id}]:`, erro);
    throw erro;
  }
}