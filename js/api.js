// Pega o IP/hostname atual da máquina na rede dinamicamente
const API_URL = `http://${window.location.hostname}:3000`;

export async function buscarRecurso(recurso) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}`);
    if (!resposta.ok) throw new Error('Erro ao buscar recurso');
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}

export async function criarRecurso(recurso, dados) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error('Erro ao criar recurso');
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}

export async function deletarRecurso(recurso, id) {
  try {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: 'DELETE'
    });
    if (!resposta.ok) throw new Error('Erro ao deletar recurso');
    return await resposta.json();
  } catch (erro) {
    console.error(`[Erro API]:`, erro);
    throw erro;
  }
}
