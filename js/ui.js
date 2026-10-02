export function renderizarTabelaProdutos(produtos, elementoContainer, callbackDeletar) {
  elementoContainer.innerHTML = '';

  if (!produtos || produtos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum equipamento cadastrado.</td>`;
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
    tdPreco.textContent = `R$ ${parseFloat(valor).toFixed(2)}`;

    const tdAcoes = document.createElement('td');
    const btnDeletar = document.createElement('button');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.style.cursor = 'pointer';
    btnDeletar.className = 'btn-danger';

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