/**
 * Módulo de Renderização e Manipulação do DOM (UI)
 */

/**
 * Renderiza as linhas da tabela de produtos/estoque no inventário
 */
export function renderizarTabelaProdutos(produtos, elementoContainer, callbackDeletar) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  if (!produtos || produtos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="subtitle">Nenhum equipamento cadastrado.</td>`;
    elementoContainer.appendChild(tr);
    return;
  }

  produtos.forEach(produto => {
    const tr = document.createElement('tr');

    const tdCodigo = document.createElement('td');
    tdCodigo.textContent = produto.codigo || produto.patrimonio || produto.id;

    const tdNome = document.createElement('td');
    tdNome.textContent = produto.nome || 'Sem nome';

    const tdTipo = document.createElement('td');
    tdTipo.textContent = produto.tipo || produto.categoria || 'N/A';

    const tdPreco = document.createElement('td');
    const valor = produto.precoVenda || produto.preco || produto.precoCusto || 0;
    tdPreco.textContent = `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const tdAcoes = document.createElement('td');
    const btnDeletar = document.createElement('button');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.className = 'btn-secondary';

    btnDeletar.addEventListener('click', () => callbackDeletar(produto.id));

    tdAcoes.appendChild(btnDeletar);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdNome);
    tr.appendChild(tdTipo);
    tr.appendChild(tdPreco);
    tr.appendChild(tdAcoes);

    elementoContainer.appendChild(tr);
  });
}

/**
 * Renderiza os registros de histórico na tela de detalhes do equipamento
 */
export function renderizarHistorico(historico, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!historico || historico.length === 0) {
    container.innerHTML = '<p class="subtitle">Nenhum evento registrado ainda.</p>';
    return;
  }

  historico.forEach(item => {
    const div = document.createElement('div');
    div.className = 'form-box';

    const smallData = document.createElement('span');
    smallData.className = 'eyebrow';
    smallData.textContent = item.data;

    const h4Titulo = document.createElement('h2');
    h4Titulo.textContent = item.titulo;

    const pDesc = document.createElement('p');
    pDesc.className = 'subtitle';
    pDesc.textContent = item.descricao;

    div.appendChild(smallData);
    div.appendChild(h4Titulo);
    div.appendChild(pDesc);
    container.appendChild(div);
  });
}