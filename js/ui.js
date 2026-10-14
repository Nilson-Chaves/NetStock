/* ==========================================================================
   RENDERIZAÇÃO DA TABELA DO INVENTÁRIO & TOMBAMENTO
   ========================================================================== */
export function renderizarTabelaProdutos(produtos, elementoContainer, callbackMoverDescarte) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  // Filtra itens descartados/obsoletos
  const ativos = (produtos || []).filter(p => 
    p.status !== 'Obsoleto' && 
    p.status !== 'Canibalizado (Peças Reaproveitadas)' && 
    p.status !== 'Reciclado (E-Waste)'
  );

  if (ativos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">Nenhum equipamento ativo cadastrado no momento.</td>`;
    elementoContainer.appendChild(tr);
    return;
  }

  ativos.forEach(item => {
    const tr = document.createElement('tr');

    const patrimonio = item.numPatrimonio || item.codigo || item.id || 'PAT-000000';
    const nome = item.nome || 'Sem Nome';
    const tipo = item.tipo || item.categoria || 'Geral';
    const loc = item.localizacao || 'Almoxarifado';
    const resp = item.responsavel || 'TI';
    const valor = parseFloat(item.precoVenda || item.preco || 0).toFixed(2);

    tr.innerHTML = `
      <td><strong>${patrimonio}</strong></td>
      <td>${nome}</td>
      <td>${tipo}</td>
      <td>${loc}</td>
      <td>${resp}</td>
      <td>R$ ${valor}</td>
      <td>
        <button class="btn-mover-descarte" style="background: #f59e0b; color: #ffffff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
          Enviar p/ Almoxarifado
        </button>
      </td>
    `;

    const btn = tr.querySelector('.btn-mover-descarte');
    if (btn && typeof callbackMoverDescarte === 'function') {
      btn.addEventListener('click', () => callbackMoverDescarte(item));
    }

    elementoContainer.appendChild(tr);
  });
}

/* ==========================================================================
   RENDERIZAÇÃO DA PAINEL DE DESCARTE (ALMOXARIFADO)
   ========================================================================== */
export function renderizarPainelDescarte(itensDescarte, elementoContainer, callbackProcessarDestino) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  if (!itensDescarte || itensDescarte.length === 0) {
    elementoContainer.innerHTML = `<p style="color: #64748b; text-align: center; padding: 20px;">Nenhum equipamento obsoleto parado no almoxarifado no momento.</p>`;
    return;
  }

  itensDescarte.forEach(item => {
    const card = document.createElement('div');
    card.style.cssText = 'border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #ffffff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
    card.innerHTML = `
      <div>
        <h4 style="margin: 0; color: #0f172a; font-size: 1rem;">${item.nome} (${item.numPatrimonio || item.codigo || item.id})</h4>
        <small style="color: #64748b;">Localização: Almoxarifado · Status: Obsoleto</small>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-canibalizar" style="background: #0284c7; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">♻️ Canibalizar Peças</button>
        <button class="btn-reciclar" style="background: #16a34a; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">📦 Reciclagem / Sucata</button>
      </div>
    `;

    card.querySelector('.btn-canibalizar').addEventListener('click', () => callbackProcessarDestino(item.id, 'Canibalizado (Peças Reaproveitadas)'));
    card.querySelector('.btn-reciclar').addEventListener('click', () => callbackProcessarDestino(item.id, 'Reciclado (E-Waste)'));

    elementoContainer.appendChild(card);
  });
}

/* ==========================================================================
   NOVA FUNÇÃO: Histórico de Baixas e Destinação Final (descarte.html)
   ========================================================================== */
export function renderizarHistoricoDescarte(itensFinalizados, elementoContainer) {
  if (!elementoContainer) return;
  elementoContainer.innerHTML = '';

  if (!itensFinalizados || itensFinalizados.length === 0) {
    elementoContainer.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">Nenhuma baixa ou descarte registrado no histórico.</p>`;
    return;
  }

  itensFinalizados.forEach(item => {
    const isCanibalizado = item.status.includes('Canibalizado');
    const corBorda = isCanibalizado ? '#0284c7' : '#16a34a';
    const icone = isCanibalizado ? '♻️' : '📦';

    const div = document.createElement('div');
    div.style.cssText = `border-left: 4px solid ${corBorda}; padding: 10px 14px; margin-bottom: 12px; background: #f8fafc; border-radius: 0 6px 6px 0;`;
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <small style="color: ${corBorda}; font-weight: bold;">${icone} ${item.status}</small>
        <small style="color: #94a3b8;">${item.dataBaixa || 'Data não registrada'}</small>
      </div>
      <h4 style="margin: 4px 0; font-size: 0.95rem; color: #0f172a;">${item.nome} (${item.numPatrimonio || item.codigo || item.id})</h4>
      <p style="margin: 0; color: #64748b; font-size: 0.85rem;">Local de Origem: ${item.localizacao || 'Almoxarifado'} · Resp: ${item.responsavel || 'TI'}</p>
    `;
    elementoContainer.appendChild(div);
  });
}