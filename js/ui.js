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
    tdCodigo.textContent = produto.codigo || produto.numPatrimonio || produto.id;

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

/* ==========================================================================
   NOVA FUNÇÃO: Tabela Patrimonial de Tombamento (tombamento.html)
   ========================================================================== */
export function renderizarTabelaTombamento(equipamentos, elementoContainer, callbackMoverDescarte) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  if (!equipamentos || equipamentos.length === 0) {
    elementoContainer.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum ativo tombado cadastrado.</td></tr>`;
    return;
  }

  equipamentos.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.numPatrimonio || item.codigo || item.id}</strong></td>
      <td>${item.nome}</td>
      <td>${item.localizacao || 'Almoxarifado'}</td>
      <td>${item.responsavel || 'Não atribuído'}</td>
      <td><span class="badge ${item.status === 'Ativo' ? 'bg-success' : 'bg-warning'}">${item.status || 'Ativo'}</span></td>
      <td>
        <button class="btn-descarte" style="background: #f59e0b; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
          Enviar p/ Almoxarifado/Descarte
        </button>
      </td>
    `;

    tr.querySelector('.btn-descarte').addEventListener('click', () => callbackMoverDescarte(item));
    elementoContainer.appendChild(tr);
  });
}

/* ==========================================================================
   NOVA FUNÇÃO: Painel de Equipamentos Obsoletos/Descarte (descarte.html)
   ========================================================================== */
export function renderizarPainelDescarte(itensDescarte, elementoContainer, callbackProcessarDestino) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  if (!itensDescarte || itensDescarte.length === 0) {
    elementoContainer.innerHTML = `<p style="color: #64748b; text-align: center;">Nenhum equipamento parado no almoxarifado aguardando destinação.</p>`;
    return;
  }

  itensDescarte.forEach(item => {
    const card = document.createElement('div');
    card.style.cssText = 'border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f8fafc; display: flex; justify-content: space-between; align-items: center;';
    card.innerHTML = `
      <div>
        <h4 style="margin: 0; color: #0f172a;">${item.nome} (${item.numPatrimonio || item.codigo || item.id})</h4>
        <small style="color: #64748b;">Status Atual: Obsoleto / Parado no Almoxarifado</small>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-canibalizar" style="background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">♻️ Canibalizar Peças</button>
        <button class="btn-reciclar" style="background: #16a34a; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">📦 Reciclagem / Sucata</button>
      </div>
    `;

    card.querySelector('.btn-canibalizar').addEventListener('click', () => callbackProcessarDestino(item.id, 'Canibalizado (Peças Reaproveitadas)'));
    card.querySelector('.btn-reciclar').addEventListener('click', () => callbackProcessarDestino(item.id, 'Reciclado (E-Waste)'));

    elementoContainer.appendChild(card);
  });
}