
// Obtém dinamicamente o host onde a aplicação está rodando
const BASE_URL = `http://${window.location.hostname}:3000`;

export async function buscarRecurso(recurso) {
  try {
    const resposta = await fetch(`${BASE_URL}/${recurso}`);
    if (!resposta.ok) throw new Error(`Erro ao buscar ${recurso}: ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}

export async function criarRecurso(recurso, dados) {
  try {
    const resposta = await fetch(`${BASE_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error(`Erro ao criar registro em ${recurso}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}

export async function deletarRecurso(recurso, id) {
  try {
    const resposta = await fetch(`${BASE_URL}/${recurso}/${id}`, {
      method: 'DELETE'
    });
    if (!resposta.ok) throw new Error(`Erro ao deletar ID ${id} em ${recurso}`);
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}