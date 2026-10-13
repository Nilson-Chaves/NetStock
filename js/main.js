import { buscarRecurso, deletarRecurso, criarRecurso, atualizarRecurso } from './api.js';
import { renderizarTabelaProdutos, renderizarTabelaTombamento, renderizarPainelDescarte } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  // Roteamento de telas
  if (path.includes('equipamento.html')) {
    await carregarDetalhesEquipamento();
  } else if (path.includes('manutencao.html')) {
    await carregarManutencao();
  } else if (path.includes('tombamento.html')) {
    await carregarTombamento();
  } else if (path.includes('descarte.html')) {
    await carregarDescarte();
  } else {
    await carregarInventario();
  }
});

/* ==========================================================================
   1. TELA DE INVENTÁRIO (ESTOQUE)
   ========================================================================== */
async function carregarInventario() {
  const tabelaBody = document.getElementById('tabela-produtos-body') || document.querySelector('tbody');
  const formCadastro = document.getElementById('form-produto');

  async function atualizarTabela() {
    if (!tabelaBody) return;
    try {
      const dados = await buscarRecurso('estoque').catch(() => []);
      renderizarTabelaProdutos(dados, tabelaBody, aoDeletarItem);
    } catch (erro) {
      console.error('Falha ao carregar estoque:', erro);
    }
  }

  async function aoDeletarItem(id) {
    if (confirm(`Deseja realmente excluir este registro (ID: ${id})?`)) {
      try {
        await deletarRecurso('estoque', id);
        atualizarTabela();
      } catch (erro) {
        alert('Erro ao excluir o registro.');
      }
    }
  }

  if (formCadastro) {
    formCadastro.onsubmit = async (e) => {
      e.preventDefault();
      
      const nomeInput = document.getElementById('nome') || document.getElementById('produto-nome');
      const catInput = document.getElementById('categoria') || document.getElementById('produto-categoria');
      const precoInput = document.getElementById('preco') || document.getElementById('produto-preco');

      const novoItem = {
        codigo: `COD-${Date.now().toString().slice(-4)}`,
        nome: nomeInput ? nomeInput.value : 'Equipamento Sem Nome',
        tipo: catInput ? catInput.value : 'Rede',
        precoVenda: precoInput ? parseFloat(precoInput.value) || 0 : 0
      };

      try {
        await criarRecurso('estoque', novoItem);
        formCadastro.reset();
        atualizarTabela();
        alert('Equipamento registrado com sucesso!');
      } catch (erro) {
        alert('Erro ao realizar o cadastro no servidor.');
      }
    };
  }

  atualizarTabela();
}

/* ==========================================================================
   2. TELA DE DETALHES DE EQUIPAMENTO
   ========================================================================== */
async function carregarDetalhesEquipamento() {
  const selectEquipamento = document.getElementById('select-equipamento');

  let lista = [
    {
      id: "EQP-2026-001",
      nome: "Switch Cisco Catalyst 2960",
      modelo: "Catalyst 2960",
      patrimonio: "PAT-884920",
      status: "Em operação",
      ip: "10.0.156.1",
      mac: "00:1A:2B:3C:4D:5E",
      localizacao: "Rack 02 - Data Center Bloco B",
      responsavel: "Wellington Silva",
      fabricante: "Cisco",
      entrada: "15/03/2026 10:00",
      historico: []
    }
  ];

  try {
    const dadosApi = await buscarRecurso('equipamentos').catch(() => null);
    if (dadosApi && dadosApi.length > 0) {
      lista = dadosApi.map((item, idx) => ({
        id: item.id || String(idx + 1),
        nome: item.nome || `Equipamento ${idx + 1}`,
        modelo: item.tipo || "Modelo Padrão",
        patrimonio: item.numPatrimonio || item.codigo || `PAT-2026-00${idx + 1}`,
        status: item.status || "Em operação",
        ip: item.especificacoes?.ipGerenciamento || `10.20.3.${10 + idx}`,
        mac: `00:1A:2B:3C:4D:${10 + idx}`,
        localizacao: item.localizacao || "Data center · Rack 01",
        responsavel: item.responsavel || "Equipe TI",
        fabricante: "NetStock",
        entrada: item.dataTombamento || "01/01/2026 10:00",
        historico: []
      }));
    }
  } catch (err) {
    console.warn('Usando dados locais de equipamentos.');
  }

  if (selectEquipamento) {
    selectEquipamento.innerHTML = lista.map((item, index) => 
      `<option value="${item.id}" ${index === 0 ? 'selected' : ''}>
        ${item.nome} (${item.patrimonio})
      </option>`
    ).join('');
  }

  let equipamentoAtualId = lista[0].id;

  function renderizarCard(eqp) {
    if (!eqp) return;
    const setTexto = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTexto('eqp-nome', eqp.nome);
    setTexto('eqp-sub', `${eqp.modelo} · patrimônio ${eqp.patrimonio}`);
    setTexto('eqp-status', eqp.status);
    setTexto('eqp-ip', eqp.ip);
    setTexto('eqp-mac', eqp.mac);
    setTexto('eqp-loc', eqp.localizacao);
    setTexto('eqp-resp', eqp.responsavel);
    setTexto('eqp-fab', eqp.fabricante);
    setTexto('eqp-entrada', eqp.entrada);

    const containerHistorico = document.getElementById('container-historico');
    renderizarHistorico(eqp.historico || [], containerHistorico);
  }

  renderizarCard(lista[0]);

  if (selectEquipamento) {
    selectEquipamento.onchange = (e) => {
      equipamentoAtualId = e.target.value;
      const eqpEncontrado = lista.find(item => String(item.id) === String(equipamentoAtualId));
      if (eqpEncontrado) renderizarCard(eqpEncontrado);
    };
  }

  const formEvento = document.getElementById('form-evento');
  if (formEvento) {
    formEvento.onsubmit = (e) => {
      e.preventDefault();

      const eqp = lista.find(item => String(item.id) === String(equipamentoAtualId));
      if (!eqp) return;

      const titulo = document.getElementById('evt-titulo')?.value || 'Movimentação';
      const novaLoc = document.getElementById('evt-loc')?.value;
      const novoResp = document.getElementById('evt-resp')?.value;
      const desc = document.getElementById('evt-desc')?.value || '';

      if (novaLoc) eqp.localizacao = novaLoc;
      if (novoResp) eqp.responsavel = novoResp;

      const novoEvento = {
        id: `h${Date.now()}`,
        data: new Date().toLocaleString('pt-BR'),
        titulo: titulo,
        descricao: `${desc}${novaLoc ? ` | Local: ${novaLoc}` : ''}${novoResp ? ` | Resp: ${novoResp}` : ''}`
      };

      eqp.historico = [novoEvento, ...(eqp.historico || [])];
      renderizarCard(eqp);
      formEvento.reset();
      alert('Evento registrado no equipamento!');
    };
  }
}

function renderizarHistorico(historico, container) {
  if (!container) return;
  container.innerHTML = '';
  
  if (!historico || historico.length === 0) {
    container.innerHTML = '<p style="color: #888; font-size: 0.85rem;">Nenhum evento registrado ainda.</p>';
    return;
  }

  historico.forEach(item => {
    const div = document.createElement('div');
    div.style.borderLeft = '3px solid #0d9488';
    div.style.paddingLeft = '12px';
    div.style.marginBottom = '12px';
    div.innerHTML = `
      <small style="color: #0d9488; font-weight: bold;">${item.data}</small>
      <h4 style="margin: 2px 0; font-size: 0.95rem; color: #222;">${item.titulo}</h4>
      <p style="margin: 0; color: #666; font-size: 0.85rem;">${item.descricao}</p>
    `;
    container.appendChild(div);
  });
}

/* ==========================================================================
   3. TELA DE MANUTENÇÃO
   ========================================================================== */
async function carregarManutencao() {
  const containerFila = document.getElementById('container-fila-manutencao');
  const modal = document.getElementById('modal-chamado');
  const btnNovo = document.getElementById('btn-novo-chamado');
  const btnFechar = document.getElementById('btn-fechar-modal');
  const formModal = document.getElementById('form-novo-chamado');
  const selectEquipamentoModal = document.getElementById('m-eqp');

  try {
    const dadosEqp = await buscarRecurso('estoque').catch(() => []);
    if (selectEquipamentoModal && dadosEqp.length > 0) {
      selectEquipamentoModal.innerHTML = dadosEqp.map(item => 
        `<option value="${item.nome}">${item.nome} (${item.codigo})</option>`
      ).join('');
    } else if (selectEquipamentoModal) {
      selectEquipamentoModal.innerHTML = `
        <option value="Servidor SV-031">Servidor SV-031</option>
        <option value="Switch SW-017">Switch SW-017</option>
        <option value="Access point AP-072">Access point AP-072</option>
      `;
    }
  } catch (err) {
    console.warn('Usando equipamentos padrão para o modal.');
  }

  let chamados = [];

  try {
    const dadosApi = await buscarRecurso('manutencao').catch(() => null);
    if (dadosApi && dadosApi.length > 0) chamados = dadosApi;
  } catch (err) {
    console.warn('Usando lista padrão de manutenção.');
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
          <button onclick="deletarChamado('${item.id}')" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; font-weight: bold;" title="Concluir/Excluir">✕</button>
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
        id: `m${Date.now()}`,
        equipamento: selectEquipamentoModal ? selectEquipamentoModal.value : 'Equipamento Generico',
        descricao: document.getElementById('m-desc')?.value || 'Sem descrição',
        status: statusTexto,
        tipoStatus: tipoStatus,
        icone: icone
      };

      chamados.unshift(novoChamado);
      renderizarFila();
      if (modal) modal.classList.remove('active');
      formModal.reset();

      try {
        await criarRecurso('manutencao', novoChamado);
      } catch (err) {
        console.log('Registro salvo localmente.');
      }
    };
  }

  window.deletarChamado = async (id) => {
    if (confirm('Marcar este chamado como concluído?')) {
      chamados = chamados.filter(item => String(item.id) !== String(id));
      renderizarFila();
      try {
        await deletarRecurso('manutencao', id);
      } catch (err) {
        console.log('Removido localmente.');
      }
    }
  };

  renderizarFila();
}

/* ==========================================================================
   4. NOVA TELA: TOMBAMENTO DE ATIVOS (tombamento.html)
   ========================================================================== */
async function carregarTombamento() {
  const containerTabela = document.getElementById('tabela-tombamento-body');
  const formTombamento = document.getElementById('form-tombamento');

  async function atualizarLista() {
    const equipamentos = await buscarRecurso('equipamentos').catch(() => []);
    const ativos = equipamentos.filter(e => e.status !== 'Obsoleto' && e.status !== 'Descarte');
    renderizarTabelaTombamento(ativos, containerTabela, aoMoverParaDescarte);
  }

  async function aoMoverParaDescarte(item) {
    if (confirm(`Mover o ativo "${item.nome}" (${item.numPatrimonio}) para o Almoxarifado / Obsoletos?`)) {
      await atualizarRecurso('equipamentos', item.id, { status: 'Obsoleto', localizacao: 'Almoxarifado' });
      atualizarLista();
    }
  }

  if (formTombamento) {
    formTombamento.onsubmit = async (e) => {
      e.preventDefault();
      const novoAtivo = {
        id: `EQP-${Date.now()}`,
        numPatrimonio: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
        nome: document.getElementById('t-nome')?.value || 'Equipamento',
        tipo: document.getElementById('t-tipo')?.value || 'Rede',
        localizacao: document.getElementById('t-local')?.value || 'Data Center',
        responsavel: document.getElementById('t-resp')?.value || 'TI',
        dataTombamento: new Date().toISOString().split('T')[0],
        status: 'Ativo'
      };

      await criarRecurso('equipamentos', novoAtivo);
      formTombamento.reset();
      atualizarLista();
      alert('Equipamento tombado e etiquetado com sucesso!');
    };
  }

  atualizarLista();
}

/* ==========================================================================
   5. NOVA TELA: GESTÃO DE OBSOLESCÊNCIA E DESCARTE (descarte.html)
   ========================================================================== */
async function carregarDescarte() {
  const containerPainel = document.getElementById('container-painel-descarte');

  async function atualizarPainel() {
    const equipamentos = await buscarRecurso('equipamentos').catch(() => []);
    const obsoletos = equipamentos.filter(e => e.status === 'Obsoleto');
    renderizarPainelDescarte(obsoletos, containerPainel, aoProcessarDestino);
  }

  async function aoProcessarDestino(id, destinoFinal) {
    if (confirm(`Confirmar baixa e destinação final como: ${destinoFinal}?`)) {
      await atualizarRecurso('equipamentos', id, { status: destinoFinal });
      atualizarPainel();
      alert(`Equipamento atualizado para: ${destinoFinal}`);
    }
  }

  atualizarPainel();
}