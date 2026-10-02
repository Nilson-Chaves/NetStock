import { buscarRecurso, deletarRecurso, criarRecurso } from './api.js';
import { renderizarTabelaProdutos } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  // Roteamento de telas
  if (path.includes('equipamento.html')) {
    await carregarDetalhesEquipamento();
  } else if (path.includes('manutencao.html')) {
    await carregarManutencao();
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

  // Dados padrão para a página nunca ficar em branco ou "Carregando..."
  let lista = [
    {
      id: "1",
      nome: "Switch SW-024",
      modelo: "Cisco Catalyst 9200",
      patrimonio: "PAT-2024-0088",
      status: "Em operação",
      ip: "10.20.3.24",
      mac: "00:1A:2B:3C:4D:5E",
      localizacao: "Data center · Rack 03",
      responsavel: "Lucas Andrade",
      fabricante: "Cisco",
      entrada: "18/03/2024 11:05",
      historico: [
        {
          id: "h1",
          data: "22/08/2026 09:14",
          titulo: "Inventário conferido",
          descricao: "Conferência trimestral realizada por Marina Costa."
        }
      ]
    },
    {
      id: "2",
      nome: "Servidor SRV-DB01",
      modelo: "Dell PowerEdge R750",
      patrimonio: "PAT-2024-0012",
      status: "Em operação",
      ip: "10.20.1.10",
      mac: "A1:B2:C3:D4:E5:F6",
      localizacao: "Data center · Rack 01",
      responsavel: "Carlos Silva",
      fabricante: "Dell",
      entrada: "10/01/2024 08:30",
      historico: []
    }
  ];

  // Busca do servidor (estoque ou equipamentos)
  try {
    const dadosApi = await buscarRecurso('estoque').catch(() => null);
    if (dadosApi && dadosApi.length > 0) {
      // Mapeia o estoque para a estrutura de equipamento
      lista = dadosApi.map((item, idx) => ({
        id: item.id || String(idx + 1),
        nome: item.nome || `Equipamento ${idx + 1}`,
        modelo: item.tipo || "Modelo Padrão",
        patrimonio: item.codigo || `PAT-2026-00${idx + 1}`,
        status: "Em operação",
        ip: `10.20.3.${10 + idx}`,
        mac: `00:1A:2B:3C:4D:${10 + idx}`,
        localizacao: "Data center · Rack 01",
        responsavel: "Equipe TI",
        fabricante: "NetStock",
        entrada: "01/01/2026 10:00",
        historico: []
      }));
    }
  } catch (err) {
    console.warn('Usando dados locais de equipamentos.');
  }

  // Preenche o Select da tela de Equipamento
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

  // Formulário de Histórico / Eventos
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

  // Preenche seletor de equipamentos do Modal vindo do estoque
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

  let chamados = [
    {
      id: "m1",
      equipamento: "Servidor SV-031",
      descricao: "Falha intermitente de armazenamento · Data center / Rack 01",
      status: "Alta prioridade",
      tipoStatus: "alta",
      icone: "!"
    },
    {
      id: "m2",
      equipamento: "Switch SW-017",
      descricao: "Substituição de fonte de energia · Filial Norte / Rack 02",
      status: "Aguardando peça",
      tipoStatus: "alerta",
      icone: "◷"
    }
  ];

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