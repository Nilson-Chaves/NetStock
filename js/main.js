import { buscarRecurso, deletarRecurso, criarRecurso, atualizarRecurso } from './api.js';
import { renderizarTabelaProdutos, renderizarPainelDescarte, renderizarHistoricoDescarte } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('equipamento.html')) {
    await carregarDetalhesEquipamento();
  } else if (path.includes('manutencao.html')) {
    await carregarManutencao();
  } else if (path.includes('descarte.html')) {
    await carregarDescarte();
  } else if (path.includes('inventario.html')) {
    await carregarInventario();
  } else {
    await carregarDashboard();
  }
});

/* ==========================================================================
   FUNÇÃO AUXILIAR: BUSCA SEGURA DE EQUIPAMENTOS
   ========================================================================== */
async function obterTodosEquipamentos() {
  try {
    let dados = await buscarRecurso('equipamentos').catch(() => []);
    if (!dados || dados.length === 0) {
      dados = await buscarRecurso('estoque').catch(() => []);
    }
    return dados || [];
  } catch (err) {
    console.error('Erro na leitura dos ativos:', err);
    return [];
  }
}

/* ==========================================================================
   1. DASHBOARD (index.html)
   ========================================================================== */
async function carregarDashboard() {
  try {
    const equipamentos = await obterTodosEquipamentos();
    const ativos = equipamentos.filter(e => 
      e.status !== 'Obsoleto' && 
      e.status !== 'Canibalizado (Peças Reaproveitadas)' && 
      e.status !== 'Reciclado (E-Waste)'
    );

    // 1. Total de Ativos
    const elTotal = document.getElementById('dash-total-ativos');
    if (elTotal) elTotal.textContent = String(ativos.length).padStart(2, '0');

    // 2. Valor Total do Patrimônio Alocado
    const valorTotal = ativos.reduce((acc, item) => {
      const v = parseFloat(item.precoVenda || item.preco || 0);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);

    const elValor = document.getElementById('dash-valor-total');
    if (elValor) elValor.textContent = `R$ ${valorTotal.toFixed(2)}`;

    // 3. Tipos/Categorias Cadastrados
    const categoriasUnicas = new Set(ativos.map(e => e.tipo || e.categoria || 'Outros'));
    const elCat = document.getElementById('dash-total-categorias');
    if (elCat) elCat.textContent = String(categoriasUnicas.size).padStart(2, '0');

    // 4. Métricas de Manutenção (OPÇÃO A)
    const chamados = await buscarRecurso('manutencao').catch(() => []);
    const elManutencao = document.getElementById('dash-total-manutencao');
    const elPrio = document.getElementById('dash-manutencao-prio');

    if (elManutencao) {
      elManutencao.textContent = String(chamados.length).padStart(2, '0');
    }
    if (elPrio) {
      const altaPrio = chamados.filter(c => c.tipoStatus === 'alta').length;
      elPrio.textContent = altaPrio > 0 ? `${altaPrio} de alta prioridade` : 'Nenhum crítico';
    }

    // 5. Tabela de Ativos Recentes
    const tabelaRecentes = document.getElementById('dash-tabela-recentes');
    if (tabelaRecentes) {
      tabelaRecentes.innerHTML = '';
      const ultimos5 = [...ativos].reverse().slice(0, 5);
      
      if (ultimos5.length === 0) {
        tabelaRecentes.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Nenhum ativo cadastrado.</td></tr>`;
      } else {
        ultimos5.forEach(item => {
          const tr = document.createElement('tr');
          const val = parseFloat(item.precoVenda || item.preco || 0).toFixed(2);
          tr.innerHTML = `
            <td><strong>${item.numPatrimonio || item.codigo || item.id}</strong></td>
            <td>${item.nome}</td>
            <td>${item.tipo || item.categoria || 'Geral'}</td>
            <td>R$ ${val}</td>
          `;
          tabelaRecentes.appendChild(tr);
        });
      }
    }

    // 6. Resumo por Categoria
    const containerDist = document.getElementById('dash-distribuicao-categorias');
    if (containerDist) {
      containerDist.innerHTML = '';
      const contagem = {};
      ativos.forEach(item => {
        const cat = item.tipo || item.categoria || 'Geral';
        contagem[cat] = (contagem[cat] || 0) + 1;
      });

      Object.entries(contagem).forEach(([cat, qtd]) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;';
        div.innerHTML = `<strong>${cat}</strong><span class="badge ok">${qtd} unidade(s)</span>`;
        containerDist.appendChild(div);
      });
    }

  } catch (erro) {
    console.error('Erro ao carregar métricas do Dashboard:', erro);
  }
}

/* ==========================================================================
   2. INVENTÁRIO & PATRIMÔNIO (inventario.html)
   ========================================================================== */
async function carregarInventario() {
  const tabelaBody = document.getElementById('tabela-produtos-body') || document.querySelector('tbody');
  const formCadastro = document.getElementById('form-produto');

  async function atualizarTabela() {
    if (!tabelaBody) return;
    const dados = await obterTodosEquipamentos();
    renderizarTabelaProdutos(dados, tabelaBody, aoMoverParaDescarte);
  }

  async function aoMoverParaDescarte(item) {
    const identificador = item.numPatrimonio || item.codigo || item.id;
    if (confirm(`Mover o ativo "${item.nome}" (${identificador}) para o Almoxarifado / Obsoletos?`)) {
      try {
        await atualizarRecurso('equipamentos', item.id, { 
          status: 'Obsoleto', 
          localizacao: 'Almoxarifado' 
        });
        await atualizarTabela();
      } catch (erro) {
        alert('Erro ao mover o registro.');
      }
    }
  }

  if (formCadastro) {
    formCadastro.onsubmit = async (e) => {
      e.preventDefault();
      
      const nomeVal = document.getElementById('nome')?.value.trim();
      const catSelect = document.getElementById('categoria');
      const catVal = catSelect ? catSelect.value : 'Outros';
      const locVal = document.getElementById('localizacao')?.value.trim();
      const respVal = document.getElementById('responsavel')?.value.trim();
      const precoVal = parseFloat(document.getElementById('preco')?.value) || 0;

      const novoAtivo = {
        numPatrimonio: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        codigo: `COD-${Date.now().toString().slice(-4)}`,
        nome: nomeVal || 'Equipamento Sem Nome',
        tipo: catVal, // Agora recebe a opção padronizada selecionada
        localizacao: locVal || 'Data Center',
        responsavel: respVal || 'TI',
        precoVenda: precoVal,
        dataTombamento: new Date().toISOString().split('T')[0],
        status: 'Ativo'
      };

      try {
        await criarRecurso('equipamentos', novoAtivo);
        formCadastro.reset();
        await atualizarTabela();
        alert('Ativo cadastrado e tombado com sucesso!');
      } catch (erro) {
        alert('Erro ao cadastrar equipamento.');
      }
    };
  }

  atualizarTabela();
}

/* ==========================================================================
   3. DETALHES DO EQUIPAMENTO (equipamento.html)
   ========================================================================== */
async function carregarDetalhesEquipamento() {
  const selectEquipamento = document.getElementById('select-equipamento');
  let lista = [];

  async function carregarLista() {
    const dadosApi = await obterTodosEquipamentos();
    lista = dadosApi.filter(e => e.status !== 'Canibalizado (Peças Reaproveitadas)' && e.status !== 'Reciclado (E-Waste)');
    
    if (lista.length === 0) return;

    if (selectEquipamento) {
      selectEquipamento.innerHTML = lista.map((item, index) => 
        `<option value="${item.id}" ${index === 0 ? 'selected' : ''}>
          ${item.nome} (${item.numPatrimonio || item.codigo || item.id})
        </option>`
      ).join('');
    }

    renderizarCard(lista[0]);
  }

  let equipamentoAtualId = null;

  function renderizarCard(eqp) {
    if (!eqp) return;
    equipamentoAtualId = eqp.id;

    const setTexto = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '-';
    };

    setTexto('eqp-nome', eqp.nome);
    setTexto('eqp-sub', `${eqp.tipo || eqp.categoria || 'Equipamento'} · patrimônio ${eqp.numPatrimonio || eqp.codigo || eqp.id}`);
    setTexto('eqp-status', eqp.status || 'Em operação');
    setTexto('eqp-ip', eqp.especificacoes?.ipGerenciamento || '10.20.3.1');
    setTexto('eqp-mac', eqp.mac || '00:1A:2B:3C:4D:5E');
    setTexto('eqp-loc', eqp.localizacao || 'Almoxarifado');
    setTexto('eqp-resp', eqp.responsavel || 'TI');
    setTexto('eqp-fab', eqp.fabricante || 'NetStock');
    setTexto('eqp-entrada', eqp.dataTombamento || '2026-01-01');

    renderizarHistoricoLocal(eqp.historico || [], document.getElementById('container-historico'));
  }

  if (selectEquipamento) {
    selectEquipamento.onchange = (e) => {
      const eqp = lista.find(item => String(item.id) === String(e.target.value));
      if (eqp) renderizarCard(eqp);
    };
  }

  const formEvento = document.getElementById('form-evento');
  if (formEvento) {
    formEvento.onsubmit = async (e) => {
      e.preventDefault();

      const eqp = lista.find(item => String(item.id) === String(equipamentoAtualId));
      if (!eqp) return;

      const titulo = document.getElementById('evt-titulo')?.value || 'Movimentação';
      const novaLoc = document.getElementById('evt-loc')?.value.trim();
      const novoResp = document.getElementById('evt-resp')?.value.trim();
      const desc = document.getElementById('evt-desc')?.value.trim() || '';

      const mudancas = {};
      if (novaLoc) {
        eqp.localizacao = novaLoc;
        mudancas.localizacao = novaLoc;
      }
      if (novoResp) {
        eqp.responsavel = novoResp;
        mudancas.responsavel = novoResp;
      }

      const novoEvento = {
        id: `h${Date.now()}`,
        data: new Date().toLocaleString('pt-BR'),
        titulo: titulo,
        descricao: `${desc}${novaLoc ? ` | Nova Loc: ${novaLoc}` : ''}${novoResp ? ` | Novo Resp: ${novoResp}` : ''}`
      };

      eqp.historico = [novoEvento, ...(eqp.historico || [])];
      mudancas.historico = eqp.historico;

      try {
        await atualizarRecurso('equipamentos', eqp.id, mudancas);
        renderizarCard(eqp);
        formEvento.reset();
        alert('Movimentação registrada com sucesso!');
      } catch (err) {
        alert('Erro ao salvar movimentação.');
      }
    };
  }

  await carregarLista();
}

function renderizarHistoricoLocal(historico, container) {
  if (!container) return;
  container.innerHTML = '';
  
  if (!historico || historico.length === 0) {
    container.innerHTML = '<p style="color: #888; font-size: 0.85rem;">Nenhum evento registrado ainda.</p>';
    return;
  }

  historico.forEach(item => {
    const div = document.createElement('div');
    div.style.cssText = 'border-left: 3px solid #0d9488; padding-left: 12px; margin-bottom: 12px;';
    div.innerHTML = `
      <small style="color: #0d9488; font-weight: bold;">${item.data}</small>
      <h4 style="margin: 2px 0; font-size: 0.95rem; color: #222;">${item.titulo}</h4>
      <p style="margin: 0; color: #666; font-size: 0.85rem;">${item.descricao}</p>
    `;
    container.appendChild(div);
  });
}

/* ==========================================================================
   4. MANUTENÇÃO (manutencao.html)
   ========================================================================== */
async function carregarManutencao() {
  const containerFila = document.getElementById('container-fila-manutencao');
  const modal = document.getElementById('modal-chamado');
  const btnNovo = document.getElementById('btn-novo-chamado');
  const btnFechar = document.getElementById('btn-fechar-modal');
  const formModal = document.getElementById('form-novo-chamado');
  const selectEquipamentoModal = document.getElementById('m-eqp');

  try {
    const dadosEqp = await obterTodosEquipamentos();
    const equipamentosValidos = dadosEqp.filter(e => 
      e.status !== 'Obsoleto' && 
      e.status !== 'Canibalizado (Peças Reaproveitadas)' && 
      e.status !== 'Reciclado (E-Waste)'
    );

    if (selectEquipamentoModal) {
      if (equipamentosValidos.length > 0) {
        selectEquipamentoModal.innerHTML = equipamentosValidos.map(item => 
          `<option value="${item.nome}">${item.nome} (${item.numPatrimonio || item.codigo || item.id})</option>`
        ).join('');
      } else {
        selectEquipamentoModal.innerHTML = `<option value="">Nenhum ativo disponível</option>`;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar equipamentos para manutenção.');
  }

  let chamados = [];
  try {
    const dadosApi = await buscarRecurso('manutencao').catch(() => []);
    if (dadosApi && dadosApi.length > 0) chamados = dadosApi;
  } catch (err) {
    console.warn('Erro ao buscar lista de manutenção.');
  }

  function renderizarFila() {
    if (!containerFila) return;
    containerFila.innerHTML = '';

    const statAbertos = document.getElementById('stat-abertos');
    const statPrioridade = document.getElementById('stat-prioridade');

    if (statAbertos) statAbertos.textContent = String(chamados.length).padStart(2, '0');
    if (statPrioridade) {
      const altPrio = chamados.filter(c => c.tipoStatus === 'alta').length;
      statPrioridade.textContent = `${altPrio} alta prioridade`;
    }

    if (chamados.length === 0) {
      containerFila.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">Nenhum chamado em aberto.</p>';
      return;
    }

    chamados.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card-item-manutencao';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 36px; height: 36px; border-radius: 6px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            ${item.icone || '◷'}
          </div>
          <div>
            <h4 style="margin: 0; font-size: 1rem; color: #1e293b;">${item.equipamento}</h4>
            <small style="color: #64748b;">${item.descricao}</small>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="badge-status ${item.tipoStatus}">${item.status}</span>
          <button onclick="deletarChamado('${item.id}')" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; font-weight: bold;">✕</button>
        </div>
      `;
      containerFila.appendChild(card);
    });
  }

  if (btnNovo) btnNovo.onclick = () => modal.classList.add('active');
  if (btnFechar) btnFechar.onclick = () => modal.classList.remove('active');

  if (formModal) {
    formModal.onsubmit = async (e) => {
      e.preventDefault();
      const selectStatus = document.getElementById('m-status');
      const [statusTexto, tipoStatus, icone] = selectStatus ? selectStatus.value.split('|') : ['Alta prioridade', 'alta', '!'];

      const novoChamado = {
        equipamento: selectEquipamentoModal ? selectEquipamentoModal.value : 'Equipamento Genérico',
        descricao: document.getElementById('m-desc')?.value || 'Sem descrição',
        status: statusTexto,
        tipoStatus: tipoStatus,
        icone: icone
      };

      try {
        const criado = await criarRecurso('manutencao', novoChamado);
        chamados.unshift(criado);
        renderizarFila();
        if (modal) modal.classList.remove('active');
        formModal.reset();
      } catch (err) {
        console.error('Erro ao abrir chamado:', err);
      }
    };
  }

  window.deletarChamado = async (id) => {
    if (confirm('Marcar este chamado como concluído?')) {
      chamados = chamados.filter(item => String(item.id) !== String(id));
      renderizarFila();
      await deletarRecurso('manutencao', id).catch(() => {});
    }
  };

  renderizarFila();
}

/* ==========================================================================
   5. DESCARTE & REUSO (descarte.html)
   ========================================================================== */
async function carregarDescarte() {
  const containerPainel = document.getElementById('container-painel-descarte');
  const containerHistorico = document.getElementById('container-historico-descarte');

  async function atualizarPainelEHistorico() {
    const equipamentos = await obterTodosEquipamentos();
    
    const obsoletos = equipamentos.filter(e => e.status === 'Obsoleto');
    renderizarPainelDescarte(obsoletos, containerPainel, aoProcessarDestino);

    const finalizados = equipamentos.filter(e => 
      e.status === 'Canibalizado (Peças Reaproveitadas)' || 
      e.status === 'Reciclado (E-Waste)'
    );
    renderizarHistoricoDescarte(finalizados, containerHistorico);
  }

  async function aoProcessarDestino(id, destinoFinal) {
    if (confirm(`Confirmar baixa e destinação final como: ${destinoFinal}?`)) {
      const dataHoje = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      try {
        await atualizarRecurso('equipamentos', id, { 
          status: destinoFinal,
          dataBaixa: dataHoje
        });
        await atualizarPainelEHistorico();
        alert(`Equipamento baixado com sucesso e registrado no histórico!`);
      } catch (err) {
        alert('Erro ao registrar a baixa do equipamento.');
      }
    }
  }

  atualizarPainelEHistorico();
}