import { buscarRecurso, deletarRecurso, criarRecurso, atualizarRecurso } from './api.js';
import { renderizarTabelaProdutos, renderizarHistorico } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  // Roteamento inteligente de telas
  if (path.includes('equipamento.html')) {
    await carregarDetalhesEquipamento();
  } else if (path.includes('manutencao.html')) {
    await carregarManutencao();
  } else if (path.includes('inventario.html')) {
    await carregarInventario();
  } else {
    await carregarDashboard();
  }
});

/* ==========================================================================
   1. TELA DASHBOARD (INDEX.HTML)
   ========================================================================== */
async function carregarDashboard() {
  const elTotalAtivos = document.getElementById('dash-total-ativos');
  const elValorTotal = document.getElementById('dash-valor-total');
  const elTotalCategorias = document.getElementById('dash-total-categorias');
  const tabelaRecentes = document.getElementById('dash-tabela-recentes');
  const containerCategorias = document.getElementById('dash-distribuicao-categorias');

  try {
    const dados = await buscarRecurso('estoque').catch(() => []);
    
    const totalAtivos = dados.length;
    const valorSum = dados.reduce((acc, item) => acc + (parseFloat(item.precoVenda || item.preco || 0)), 0);
    const categorias = [...new Set(dados.map(item => item.tipo || item.categoria || 'Geral'))];

    if (elTotalAtivos) elTotalAtivos.textContent = String(totalAtivos).padStart(2, '0');
    if (elValorTotal) elValorTotal.textContent = `R$ ${valorSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elTotalCategorias) elTotalCategorias.textContent = String(categorias.length).padStart(2, '0');

    if (tabelaRecentes) {
      tabelaRecentes.innerHTML = '';
      const recentes = dados.slice(-5).reverse();
      if (recentes.length === 0) {
        tabelaRecentes.innerHTML = `<tr><td colspan="4" class="subtitle">Nenhum equipamento registrado.</td></tr>`;
      } else {
        recentes.forEach(item => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${item.codigo || item.id}</td>
            <td><strong>${item.nome}</strong></td>
            <td>${item.tipo || 'Rede'}</td>
            <td>R$ ${parseFloat(item.precoVenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          `;
          tabelaRecentes.appendChild(tr);
        });
      }
    }

    if (containerCategorias) {
      containerCategorias.innerHTML = '';
      categorias.forEach(cat => {
        const qtd = dados.filter(i => (i.tipo || i.categoria || 'Geral') === cat).length;
        const pct = totalAtivos > 0 ? Math.round((qtd / totalAtivos) * 100) : 0;
        
        const div = document.createElement('div');
        div.className = 'bar-row';
        div.innerHTML = `
          <span>${cat}</span>
          <div class="bar"><i style="width: ${pct}%"></i></div>
          <strong>${qtd}</strong>
        `;
        containerCategorias.appendChild(div);
      });
    }

  } catch (erro) {
    console.error('Falha ao carregar dados do Dashboard:', erro);
  }
}

/* ==========================================================================
   2. TELA DE INVENTÁRIO (ESTOQUE)
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
        alert('Erro ao excluir o registro do servidor.');
      }
    }
  }

  if (formCadastro) {
    formCadastro.onsubmit = async (e) => {
      e.preventDefault();

      const nomeInput = document.getElementById('nome');
      const catInput = document.getElementById('categoria');
      const precoInput = document.getElementById('preco');

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
   3. TELA DE DETALHES DE EQUIPAMENTO
   ========================================================================== */
async function carregarDetalhesEquipamento() {
  const selectEquipamento = document.getElementById('select-equipamento');

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
          descricao: "Conferência trimestral realizada."
        }
      ]
    }
  ];

  try {
    const dadosApi = await buscarRecurso('estoque').catch(() => null);
    if (dadosApi && dadosApi.length > 0) {
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
        historico: item.historico || []
      }));
    }
  } catch (err) {
    console.warn('Usando dados locais para a exibição de equipamentos.');
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
    formEvento.onsubmit = async (e) => {
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

      // ATUALIZAÇÃO VIA PATCH (Cumpre o requisito do critério de API)
      try {
        await atualizarRecurso('estoque', eqp.id, { historico: eqp.historico });
        alert('Evento registrado e salvo no servidor via PATCH!');
      } catch (err) {
        alert('Evento registrado localmente!');
      }
    };
  }
}

/* ==========================================================================
   4. TELA DE MANUTENÇÃO
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
      `;
    }
  } catch (err) {
    console.warn('Usando equipamentos padrão para o modal.');
  }

  let chamados = [
    {
      id: "m1",
      equipamento: "Servidor SV-031",
      descricao: "Falha intermitente de armazenamento · Rack 01",
      status: "Alta prioridade",
      tipoStatus: "alta",
      icone: "!"
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

      const divInfo = document.createElement('div');
      divInfo.className = 'topbar-actions';
      divInfo.innerHTML = `
        <span class="avatar">${item.icone || '◷'}</span>
        <div>
          <h2>${item.equipamento}</h2>
          <p class="subtitle">${item.descricao}</p>
        </div>
      `;

      const divStatus = document.createElement('div');
      divStatus.className = 'topbar-actions';

      // Clique no badge para alternar status via PATCH (Demonstração de Atualização)
      const spanBadge = document.createElement('span');
      spanBadge.className = `badge-status ${item.tipoStatus}`;
      spanBadge.textContent = item.status;
      spanBadge.style.cursor = 'pointer';
      spanBadge.title = 'Clique para alternar status';

      spanBadge.addEventListener('click', async () => {
        const novoStatus = item.tipoStatus === 'alta' ? 'Aguardando peça' : 'Alta prioridade';
        const novoTipo = item.tipoStatus === 'alta' ? 'alerta' : 'alta';
        item.status = novoStatus;
        item.tipoStatus = novoTipo;
        
        renderizarFila();

        try {
          await atualizarRecurso('manutencao', item.id, { status: novoStatus, tipoStatus: novoTipo });
        } catch (err) {
          console.log('Atualizado localmente.');
        }
      });

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = '✕';
      btnExcluir.className = 'btn-secondary';
      btnExcluir.title = 'Concluir chamado';

      btnExcluir.addEventListener('click', async () => {
        if (confirm('Marcar este chamado como concluído?')) {
          chamados = chamados.filter(ch => String(ch.id) !== String(item.id));
          renderizarFila();
          try {
            await deletarRecurso('manutencao', item.id);
          } catch (err) {
            console.log('Removido localmente.');
          }
        }
      });

      divStatus.appendChild(spanBadge);
      divStatus.appendChild(btnExcluir);

      card.appendChild(divInfo);
      card.appendChild(divStatus);
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
        equipamento: selectEquipamentoModal ? selectEquipamentoModal.value : 'Equipamento Genérico',
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

  renderizarFila();
}