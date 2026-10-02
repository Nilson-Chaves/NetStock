export function renderizarTabelaProdutos(produtos, elementoContainer, callbackDeletar) {
  elementoContainer.innerHTML = ''; // Limpa a tabela

  if (!produtos || produtos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum produto cadastrado.</td>`;
    elementoContainer.appendChild(tr);
    return;
  }

  produtos.forEach(produto => {
    const tr = document.createElement('tr');

    const tdCodigo = document.createElement('td');
    tdCodigo.textContent = produto.codigo || produto.id;

    const tdNome = document.createElement('td');
    tdNome.textContent = produto.nome;

    const tdCategoria = document.createElement('td');
    tdCategoria.textContent = produto.categoria;

    const tdPreco = document.createElement('td');
    tdPreco.textContent = `R$ ${produto.precoVenda || produto.precoCusto || 0}`;

    const tdAcoes = document.createElement('td');
    const btnDeletar = document.createElement('button');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.style.cursor = 'pointer';
    btnDeletar.className = 'btn-danger';

    // Tratamento de Evento no botão dinâmico
    btnDeletar.addEventListener('click', () => callbackDeletar(produto.id));

    tdAcoes.appendChild(btnDeletar);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdNome);
    tr.appendChild(tdCategoria);
    tr.appendChild(tdPreco);
    tr.appendChild(tdAcoes);

    elementoContainer.appendChild(tr);
  });
}