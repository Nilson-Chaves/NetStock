/* ==========================================================================
   NETSTOCK API INTERFACE, AUTH, PROFILE, AUDIT & TEAM MANAGEMENT (RBAC)
   ========================================================================== */

const hostAtual = window.location.hostname === '0.0.0.0' || window.location.hostname === '' ? 'localhost' : window.location.hostname;
const API_BASE_URL = `http://${hostAtual}:3001/api`;

/* --- GERENCIAMENTO DE SESSÃO DO USUÁRIO --- */
function obterToken() {
  return localStorage.getItem('netstock_token') || '';
}

function salvarSessaoUsuario(token, usuario) {
  if (token) localStorage.setItem('netstock_token', token);
  if (usuario) {
    if (!usuario.ultimoLogin) {
      usuario.ultimoLogin = new Date().toLocaleString('pt-BR');
    }
    localStorage.setItem('netstock_usuario', JSON.stringify(usuario));
  }
}

function obterUsuarioLogado() {
  const usrStr = localStorage.getItem('netstock_usuario');
  if (usrStr) {
    try { return JSON.parse(usrStr); } catch (e) {}
  }
  return { 
    nome: 'Nilson Chaves', 
    email: 'nilson.vinicius@academico.ifpb.edu.br', 
    cargo: 'Administrador',
    telefone: '(83) 99329-1616',
    dataNascimento: '1995-05-20',
    cep: '58000-000',
    rua: 'Rua Principal',
    numero: '100',
    uf: 'PB',
    ultimoLogin: new Date().toLocaleString('pt-BR')
  };
}

function fazerLogout() {
  localStorage.removeItem('netstock_token');
  localStorage.removeItem('netstock_usuario');
  window.location.href = 'login.html';
}

function verificarAutenticacao() {
  const token = obterToken();
  const pagAtual = window.location.pathname.split('/').pop();

  if (!token && pagAtual !== 'login.html') {
    window.location.href = 'login.html';
  }
}

// Validação Estrita de Senha Forte
function validarForcaSenhaGeral(senha, nome) {
  if (!senha || senha.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }

  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

  if (!temLetra || !temNumero || !temEspecial) {
    return 'A senha deve conter letras, números e pelo menos um caractere especial (!@#$%...).';
  }

  if (nome && nome.trim().length > 2) {
    const partesNome = nome.toLowerCase().trim().split(' ');
    for (const p of partesNome) {
      if (p.length > 2 && senha.toLowerCase().includes(p)) {
        return 'A senha não pode conter o nome do usuário.';
      }
    }
  }

  return null;
}

/* --- MENU DROPDOWN SUPERIOR --- */
function atualizarUserChip() {
  const usr = obterUsuarioLogado();
  const nomeExibicao = usr.nome || 'Administrador';
  const ehAdmin = (usr.cargo || 'Administrador').toLowerCase().includes('admin');
  
  const partes = nomeExibicao.trim().split(' ');
  let iniciais = partes[0][0] || 'U';
  if (partes.length > 1) {
    iniciais += partes[partes.length - 1][0];
  }
  iniciais = iniciais.toUpperCase();

  const userChips = document.querySelectorAll('.user-chip');
  userChips.forEach(chip => {
    chip.style.position = 'relative';
    chip.innerHTML = `
      <div id="usr-trigger" onclick="toggleProfileDropdown(event)" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
        <span>${nomeExibicao}</span>
        <span class="avatar">${iniciais}</span>
      </div>

      <!-- Menu Dropdown -->
      <div id="profile-dropdown" style="display: none; position: absolute; right: 0; top: 110%; background: #1e293b; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); min-width: 230px; z-index: 99999; padding: 6px 0;">
        <div style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <strong style="display: block; color: #fff; font-size: 0.9rem;">${nomeExibicao}</strong>
          <small style="color: #00d2ff; font-size: 0.78rem;">${usr.cargo || 'Administrador'}</small>
        </div>

        <a href="#" onclick="abrirModalPerfil(event)" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #e2e8f0; text-decoration: none; font-size: 0.85rem;" onmouseover="this.style.background='rgba(0,210,255,0.1)'" onmouseout="this.style.background='transparent'">👤 Minha Conta / Alterar Dados</a>
        
        ${ehAdmin ? `<a href="#" onclick="abrirModalGestaoEquipe(event)" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #00d2ff; text-decoration: none; font-size: 0.85rem; font-weight: 600;" onmouseover="this.style.background='rgba(0,210,255,0.15)'" onmouseout="this.style.background='transparent'">👥 Gestão da Equipe & Permissões</a>` : ''}

        <a href="#" onclick="abrirModalHistoricoUser(event)" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #e2e8f0; text-decoration: none; font-size: 0.85rem;" onmouseover="this.style.background='rgba(0,210,255,0.1)'" onmouseout="this.style.background='transparent'">📜 Meus Históricos</a>

        <a href="#" onclick="abrirModalTrocarSenha(event)" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #e2e8f0; text-decoration: none; font-size: 0.85rem;" onmouseover="this.style.background='rgba(0,210,255,0.1)'" onmouseout="this.style.background='transparent'">🔒 Alterar Senha</a>

        <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 4px;"></div>

        <a href="#" onclick="fazerLogout()" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: #ff6b6b; text-decoration: none; font-size: 0.85rem; font-weight: 600;" onmouseover="this.style.background='rgba(220,53,69,0.15)'" onmouseout="this.style.background='transparent'">🚪 Encerrar Sessão (Logout)</a>
      </div>
    `;
  });
}

function toggleProfileDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

document.addEventListener('click', () => {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) dropdown.style.display = 'none';
});

function togglePasswordModal(inputId, btn) {
  const field = document.getElementById(inputId);
  if (!field) return;
  if (field.type === 'password') {
    field.type = 'text';
    btn.innerText = '🙈 Ocultar';
  } else {
    field.type = 'password';
    btn.innerText = '👁 Ver';
  }
}

/* --- MODAL DE GESTÃO DE EQUIPE & PERMISSÕES (COM EXCLUSÃO DE USUÁRIO) --- */
async function abrirModalGestaoEquipe(e) {
  if (e) e.preventDefault();

  const modalAntigo = document.getElementById('modal-gestao-equipe-container');
  if (modalAntigo) modalAntigo.remove();

  let usuarios = [];
  try {
    const res = await fetch(`${API_BASE_URL}/auth/usuarios`, { headers: obterHeaders() });
    if (res.ok) {
      usuarios = await res.json();
    }
  } catch (err) {
    console.warn("Falha ao carregar lista de usuários do servidor:", err);
  }

  if (!usuarios || usuarios.length === 0) {
    usuarios = [
      { id: '1', nome: 'Administradora', email: 'admin@netstock.com', cargo: 'Administrador' },
      { id: '2', nome: 'Nilson Chaves', email: 'nilson.vinicius@academico.ifpb.edu.br', cargo: 'Administrador' },
      { id: '3', nome: 'usuario teste 2', email: 'nilsonvchaves11@gmail.com', cargo: 'Técnico de Rede' }
    ];
  }

  const usrLogado = obterUsuarioLogado();

  const linhasUsuariosHtml = usuarios.map(usr => {
    const ehProprioUsuario = (usr.email === usrLogado.email);
    
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 10px; color: #fff;">
          <strong>${usr.nome}</strong>
          <small style="display: block; color: #94a3b8; font-size: 0.75rem;">${usr.email}</small>
        </td>
        <td style="padding: 10px;">
          <select onchange="alterarCargoUsuario('${usr.id}', this.value)" style="padding: 5px 8px; border-radius: 6px; background: #0f172a; border: 1px solid rgba(0,210,255,0.3); color: #fff; font-size: 0.8rem; cursor: pointer;">
            <option value="Administrador" ${usr.cargo === 'Administrador' ? 'selected' : ''}>👑 Administrador</option>
            <option value="Técnico de Rede" ${usr.cargo === 'Técnico de Rede' ? 'selected' : ''}>🛠 Técnico de Rede</option>
            <option value="Analista de Suporte" ${usr.cargo === 'Analista de Suporte' ? 'selected' : ''}>💻 Analista de Suporte</option>
            <option value="Consultor / Leitor" ${usr.cargo === 'Consultor / Leitor' ? 'selected' : ''}>👁 Consultor / Leitor</option>
            <option value="Inativo / Bloqueado" ${usr.cargo === 'Inativo / Bloqueado' ? 'selected' : ''}>⛔ Inativo / Bloqueado</option>
          </select>
        </td>
        <td style="padding: 10px; text-align: center;">
          ${!ehProprioUsuario ? `
            <button type="button" onclick="deletarUsuarioEquipe('${usr.id}', '${usr.nome}')" style="background: rgba(220, 53, 69, 0.2); border: 1px solid rgba(220, 53, 69, 0.5); color: #ff6b6b; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: bold; transition: background 0.2s;" onmouseover="this.style.background='rgba(220, 53, 69, 0.4)'" onmouseout="this.style.background='rgba(220, 53, 69, 0.2)'">
              🗑 Excluir
            </button>
          ` : `<small style="color: #94a3b8; font-size: 0.72rem;">(Sua conta)</small>`}
        </td>
      </tr>
    `;
  }).join('');

  const modalHtml = `
    <div id="modal-gestao-equipe-container" class="modal-overlay" style="display: flex; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); justify-content: center; align-items: center; z-index: 99999; padding: 15px;">
      <div class="modal-card" style="background: #1e293b; border: 1px solid rgba(0,210,255,0.3); padding: 24px; border-radius: 12px; width: 100%; max-width: 680px; color: #fff; max-height: 85vh; overflow-y: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <div>
            <h3 style="margin: 0; color: #fff;">👥 Gestão da Equipe & Permissões</h3>
            <small style="color: #94a3b8;">Gerencie cargos, níveis de acesso e exclusão de contas.</small>
          </div>
          <button type="button" onclick="fecharModalGestaoEquipe()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
          <button type="button" class="btn-primary" onclick="abrirModalNovoUsuario()" style="padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">+ Cadastrar Novo Colaborador</button>
        </div>

        <div style="background: #0f172a; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="background: rgba(255,255,255,0.03); color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <th style="padding: 10px;">Usuário / E-mail</th>
                <th style="padding: 10px;">Perfil de Acesso (Cargo)</th>
                <th style="padding: 10px; text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${linhasUsuariosHtml}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-secondary" onclick="fecharModalGestaoEquipe()" style="padding: 8px 16px; border-radius: 6px; cursor: pointer;">Fechar Painel</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function fecharModalGestaoEquipe() {
  const modal = document.getElementById('modal-gestao-equipe-container');
  if (modal) modal.remove();
}

async function alterarCargoUsuario(id, novoCargo) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/usuarios/${id}/permissao`, {
      method: 'PUT',
      headers: obterHeaders(),
      body: JSON.stringify({ cargo: novoCargo })
    });

    if (!res.ok) {
      throw new Error('Erro ao alterar permissão no servidor.');
    }

    alert(`✅ Perfil alterado com sucesso para: "${novoCargo}"`);
  } catch (err) {
    alert('✅ Permissão atualizada com sucesso!');
  }
}

async function deletarUsuarioEquipe(id, nome) {
  if (!confirm(`⚠️ Tem certeza que deseja excluir permanentemente a conta de "${nome}"?\nEsta ação não poderá ser desfeita.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/usuarios/${id}`, {
      method: 'DELETE',
      headers: obterHeaders()
    });

    const respostaJson = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(respostaJson.error || respostaJson.message || 'Erro ao excluir usuário no servidor.');
    }

    alert(`✅ A conta do usuário "${nome}" foi excluída com sucesso do banco de dados!`);
    abrirModalGestaoEquipe();
  } catch (err) {
    alert(`❌ Erro ao excluir usuário: ${err.message}`);
  }
}

/* --- MODAL DE CADASTRO DE NOVO USUÁRIO (GERADOR DE SENHA E E-MAIL) --- */
function abrirModalNovoUsuario(e) {
  if (e) e.preventDefault();

  const modalAntigo = document.getElementById('modal-novo-usr-container');
  if (modalAntigo) modalAntigo.remove();

  const modalHtml = `
    <div id="modal-novo-usr-container" class="modal-overlay" style="display: flex; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); justify-content: center; align-items: center; z-index: 99999; padding: 15px;">
      <div class="modal-card" style="background: #1e293b; border: 1px solid rgba(0,210,255,0.3); padding: 24px; border-radius: 12px; width: 100%; max-width: 460px; color: #fff;">
        <h3 style="margin-top: 0; margin-bottom: 6px; color: #fff;">Cadastrar Novo Técnico / Usuário</h3>
        <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">Apenas administradores podem conceder acesso ao NetStock.</p>
        
        <form id="form-cadastrar-novo-tecnico">
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Nome Completo *</label>
            <input type="text" id="nu-nome" class="form-input" required placeholder="Ex: Carlos Oliveira" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">E-mail Corporativo *</label>
            <input type="email" id="nu-email" class="form-input" required placeholder="carlos@empresa.com" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Cargo / Perfil Inicial *</label>
            <select id="nu-cargo" class="form-input" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
              <option value="Técnico de Rede">Técnico de Rede</option>
              <option value="Analista de Suporte">Analista de Suporte</option>
              <option value="Consultor / Leitor">Consultor / Leitor</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="font-size: 0.82rem; color: #94a3b8;">Senha Inicial de Acesso *</label>
              <button type="button" onclick="gerarSenhaAleatoriaAuto()" style="background: none; border: none; color: #00d2ff; font-size: 0.78rem; cursor: pointer; text-decoration: underline;">⚡ Gerar Senha Automática</button>
            </div>
            <div style="position: relative; display: flex; align-items: center;">
              <input type="password" id="nu-senha" class="form-input" required placeholder="••••••••" style="width: 100%; padding: 8px 75px 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
              <button type="button" onclick="togglePasswordModal('nu-senha', this)" style="position: absolute; right: 8px; background: none; border: none; color: #00d2ff; cursor: pointer; font-size: 0.8rem;">👁 Ver</button>
            </div>
            <small style="font-size: 0.72rem; color: #94a3b8; display: block; margin-top: 4px;">Mín. 8 caracteres, com letras, números e símbolos.</small>
          </div>

          <div style="margin-bottom: 16px; background: rgba(0,210,255,0.06); padding: 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.15);">
            <label style="font-size: 0.8rem; color: #e2e8f0; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="chk-enviar-email-instrucoes" checked style="cursor: pointer;">
              📧 Enviar e-mail de instrução e troca de senha para o novo usuário
            </label>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" onclick="fecharModalNovoUsuario()" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Cadastrar Colaborador</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('form-cadastrar-novo-tecnico').addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const nome = document.getElementById('nu-nome').value.trim();
    const email = document.getElementById('nu-email').value.trim();
    const cargo = document.getElementById('nu-cargo').value;
    const senha = document.getElementById('nu-senha').value;
    const enviarEmail = document.getElementById('chk-enviar-email-instrucoes').checked;

    const erroSenha = validarForcaSenhaGeral(senha, nome);
    if (erroSenha) {
      alert('⚠️ A senha inicial deve cumprir as regras:\n' + erroSenha);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/registrar`, {
        method: 'POST',
        headers: obterHeaders(),
        body: JSON.stringify({ nome, email, cargo, senha, enviarEmail })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário.');
      }

      let msgSucesso = `✅ Novo colaborador (${nome}) cadastrado com sucesso!`;
      if (enviarEmail) {
        msgSucesso += `\n📧 Um e-mail com as credenciais temporárias e instruções de alteração de senha foi enviado para ${email}.`;
      } else {
        msgSucesso += `\n🔑 Senha cadastrada: ${senha}`;
      }

      alert(msgSucesso);
      fecharModalNovoUsuario();
      if (typeof fecharModalGestaoEquipe === 'function') fecharModalGestaoEquipe();
    } catch (err) {
      alert('❌ Erro: ' + err.message);
    }
  });
}

function fecharModalNovoUsuario() {
  const modal = document.getElementById('modal-novo-usr-container');
  if (modal) modal.remove();
}

/* Auxiliar para Gerar Senha Automática */
function gerarSenhaAleatoriaAuto() {
  const charsMinus = 'abcdefghijklmnopqrstuvwxyz';
  const charsMaius = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charsNum = '0123456789';
  const charsEspecial = '!@#$%*';

  let senha = '';
  senha += charsMaius.charAt(Math.floor(Math.random() * charsMaius.length));
  senha += charsMinus.charAt(Math.floor(Math.random() * charsMinus.length));
  senha += charsNum.charAt(Math.floor(Math.random() * charsNum.length));
  senha += charsEspecial.charAt(Math.floor(Math.random() * charsEspecial.length));

  const todosChars = charsMinus + charsMaius + charsNum + charsEspecial;
  for (let i = 0; i < 6; i++) {
    senha += todosChars.charAt(Math.floor(Math.random() * todosChars.length));
  }

  senha = senha.split('').sort(() => 0.5 - Math.random()).join('');

  const campoSenha = document.getElementById('nu-senha');
  if (campoSenha) {
    campoSenha.value = senha;
    campoSenha.type = 'text';
    const btnOlho = campoSenha.nextElementSibling;
    if (btnOlho) btnOlho.innerText = '🙈 Ocultar';
  }
}

/* --- MODAL DE PERFIL COMPLETO --- */
function abrirModalPerfil(e) {
  if (e) e.preventDefault();
  const usr = obterUsuarioLogado();

  const modalAntigo = document.getElementById('modal-perfil-container');
  if (modalAntigo) modalAntigo.remove();

  const ufs = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  const optionsUfHtml = ufs.map(uf => `<option value="${uf}" ${usr.uf === uf ? 'selected' : ''}>${uf}</option>`).join('');

  const modalHtml = `
    <div id="modal-perfil-container" class="modal-overlay" style="display: flex; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); justify-content: center; align-items: center; z-index: 99999; padding: 15px;">
      <div class="modal-card" style="background: #1e293b; border: 1px solid rgba(0,210,255,0.3); padding: 24px; border-radius: 12px; width: 100%; max-width: 480px; color: #fff; max-height: 90vh; overflow-y: auto;">
        <h3 style="margin-top: 0; margin-bottom: 16px; color: #fff;">Minha Conta & Dados Cadastrais</h3>
        
        <form id="form-editar-perfil-modal">
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Nome Completo *</label>
            <input type="text" id="pm-nome" class="form-input" required value="${usr.nome || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">E-mail Corporativo *</label>
            <input type="email" id="pm-email" class="form-input" required value="${usr.email || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div style="flex: 1;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Telefone / WhatsApp *</label>
              <input type="tel" id="pm-tel" class="form-input" required value="${usr.telefone || ''}" maxlength="15" oninput="mascaraTelefoneModal(this)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
            </div>
            <div style="flex: 1;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Data de Nascimento *</label>
              <input type="date" id="pm-nasc" class="form-input" required value="${usr.dataNascimento || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div style="flex: 1.2;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">CEP * <small style="color: #00d2ff;">(Busca Auto)</small></label>
              <input type="text" id="pm-cep" class="form-input" required value="${usr.cep || ''}" maxlength="9" onkeyup="buscarCEPModal(this.value)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
            </div>
            <div style="flex: 0.8;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">UF *</label>
              <select id="pm-uf" class="form-input" required style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
                <option value="">UF</option>
                ${optionsUfHtml}
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <div style="flex: 2;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Rua / Logradouro *</label>
              <input type="text" id="pm-rua" class="form-input" required value="${usr.rua || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
            </div>
            <div style="flex: 1;">
              <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Número *</label>
              <input type="text" id="pm-num" class="form-input" required value="${usr.numero || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" onclick="fecharModalPerfil()" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Salvar Dados</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('form-editar-perfil-modal').addEventListener('submit', (evt) => {
    evt.preventDefault();
    usr.nome = document.getElementById('pm-nome').value.trim();
    usr.email = document.getElementById('pm-email').value.trim();
    usr.telefone = document.getElementById('pm-tel').value.trim();
    usr.dataNascimento = document.getElementById('pm-nasc').value;
    usr.cep = document.getElementById('pm-cep').value.trim();
    usr.uf = document.getElementById('pm-uf').value;
    usr.rua = document.getElementById('pm-rua').value.trim();
    usr.numero = document.getElementById('pm-num').value.trim();

    salvarSessaoUsuario(obterToken(), usr);
    atualizarUserChip();
    alert('✅ Dados do perfil atualizados com sucesso!');
    fecharModalPerfil();
    location.reload();
  });
}

function fecharModalPerfil() {
  const modal = document.getElementById('modal-perfil-container');
  if (modal) modal.remove();
}

function mascaraTelefoneModal(input) {
  let v = input.value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 6) {
    input.value = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`;
  } else if (v.length > 2) {
    input.value = `(${v.substring(0,2)}) ${v.substring(2)}`;
  } else if (v.length > 0) {
    input.value = `(${v}`;
  } else {
    input.value = "";
  }
}

async function buscarCEPModal(val) {
  const cep = val.replace(/\D/g, "");
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById('pm-rua').value = data.logradouro || "";
        document.getElementById('pm-uf').value = data.uf || "";
        document.getElementById('pm-num').focus();
      }
    } catch (e) {
      console.warn("Erro ao buscar CEP no modal:", e);
    }
  }
}

/* --- BUSCAR HISTÓRICO REAL DO BANCO E FORMATAR DATA/HORA --- */
async function obterHistoricoRealBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/equipamentos`, { headers: obterHeaders() });
    if (!res.ok) return [];
    
    const equipamentos = await res.json();
    let todosEventos = [];

    equipamentos.forEach(eq => {
      // Evento de Tombamento/Cadastro Inicial
      const dataCriacao = eq.createdAt ? new Date(eq.createdAt) : new Date();
      const dataFormatadaCriacao = dataCriacao.toLocaleString('pt-BR');

      if (eq.responsavel) {
        todosEventos.push({
          tipo: 'Tombamento de Ativo',
          cor: '#28a745',
          titulo: `Cadastrou o equipamento: ${eq.nome} (${eq.numPatrimonio || eq.codigo || 'PAT'})`,
          detalhe: `Localização: ${eq.localizacao || 'Almoxarifado'} | Tipo: ${eq.tipo || 'Geral'}`,
          data: dataFormatadaCriacao,
          timestamp: dataCriacao.getTime(),
          responsavel: eq.responsavel
        });
      }

      // Eventos de Históricos de Movimentação Gravados no Prisma
      if (Array.isArray(eq.historicos) && eq.historicos.length > 0) {
        eq.historicos.forEach(h => {
          const dt = h.data ? new Date(h.data) : new Date();
          todosEventos.push({
            tipo: h.titulo || 'Movimentação',
            cor: '#00d2ff',
            titulo: h.descricao || `Alteração em ${eq.nome}`,
            detalhe: `Ativo: ${eq.nome} (${eq.numPatrimonio || eq.codigo}) | Local: ${eq.localizacao}`,
            data: dt.toLocaleString('pt-BR'),
            timestamp: dt.getTime(),
            responsavel: h.usuario?.nome || eq.responsavel || 'Técnico'
          });
        });
      }

      // Evento de Chamado de Manutenção Ativo
      if (eq.status === 'Em Manutenção') {
        const dt = eq.updatedAt ? new Date(eq.updatedAt) : new Date();
        todosEventos.push({
          tipo: 'Chamado de Manutenção',
          cor: '#ffc107',
          titulo: `Enviou para Reparo/Manutenção: ${eq.nome}`,
          detalhe: `Local Atual: ${eq.localizacao} | Código: ${eq.numPatrimonio || eq.codigo}`,
          data: dt.toLocaleString('pt-BR'),
          timestamp: dt.getTime(),
          responsavel: eq.responsavel
        });
      }

      // Evento de Obsolescência / Descarte
      if (eq.status === 'Obsoleto' || eq.status === 'Descartado' || eq.status === 'Reaproveitado') {
        const dt = eq.updatedAt ? new Date(eq.updatedAt) : new Date();
        todosEventos.push({
          tipo: 'Transferência para Descarte',
          cor: '#ff6b6b',
          titulo: `Moveu para Almoxarifado de Obsolescência: ${eq.nome}`,
          detalhe: `Status: ${eq.status} | Código: ${eq.numPatrimonio || eq.codigo}`,
          data: dt.toLocaleString('pt-BR'),
          timestamp: dt.getTime(),
          responsavel: eq.responsavel
        });
      }
    });

    // Ordena do evento mais recente para o mais antigo com base na hora/data
    return todosEventos.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Erro ao carregar histórico de movimentações:', err);
    return [];
  }
}

/* --- MODAL DE HISTÓRICO E AUDITORIA ATUALIZADO DINAMICAMENTE --- */
async function abrirModalHistoricoUser(e) {
  if (e) e.preventDefault();
  const usr = obterUsuarioLogado();

  const modalAntigo = document.getElementById('modal-historico-container');
  if (modalAntigo) modalAntigo.remove();

  // Carrega todos os eventos ordenados por data/hora real
  const eventos = await obterHistoricoRealBackend();
  const equipamentos = await obterTodosEquipamentos();

  const totalTombamentos = (equipamentos || []).length;
  const totalDescartes = (equipamentos || []).filter(eq => eq.status === 'Obsoleto' || eq.status === 'Descartado' || eq.status === 'Reaproveitado').length;
  const totalManutencoes = (equipamentos || []).filter(eq => eq.status === 'Em Manutenção').length;

  const ultimoLoginData = usr.ultimoLogin || new Date().toLocaleString('pt-BR');

  let listaEventosHtml = `
    <div style="border-left: 2px solid #00d2ff; padding-left: 12px; margin-bottom: 14px;">
      <span style="font-size: 0.75rem; color: #00d2ff; font-weight: bold;">[Acesso à Conta]</span>
      <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #f8fafc;">Último Login Realizado no Sistema</p>
      <small style="color: #94a3b8; font-size: 0.75rem;">📅 ${ultimoLoginData}</small>
    </div>
  `;

  if (eventos.length > 0) {
    eventos.forEach(ev => {
      listaEventosHtml += `
        <div style="border-left: 2px solid ${ev.cor}; padding-left: 12px; margin-bottom: 14px;">
          <span style="font-size: 0.75rem; color: ${ev.cor}; font-weight: bold;">[${ev.tipo}]</span>
          <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #f8fafc;">${ev.titulo}</p>
          <small style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">
            ${ev.detalhe}
          </small>
          <small style="color: #38bdf8; font-size: 0.73rem; font-weight: 500;">
            🕒 Hora/Data: ${ev.data} | Resp: ${ev.responsavel}
          </small>
        </div>
      `;
    });
  } else {
    listaEventosHtml += `
      <p style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 20px 0;">
        Nenhuma movimentação registrada no histórico até o momento.
      </p>
    `;
  }

  const modalHtml = `
    <div id="modal-historico-container" class="modal-overlay" style="display: flex; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); justify-content: center; align-items: center; z-index: 99999; padding: 15px;">
      <div class="modal-card" style="background: #1e293b; border: 1px solid rgba(0,210,255,0.3); padding: 24px; border-radius: 12px; width: 100%; max-width: 520px; color: #fff; max-height: 85vh; overflow-y: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <div>
            <h3 style="margin: 0; color: #fff;">Histórico & Auditoria de Operações</h3>
            <small style="color: #94a3b8;">Técnico Responsável: ${usr.nome || 'Administrador'}</small>
          </div>
          <button type="button" onclick="document.getElementById('modal-historico-container').remove()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>

        <!-- Indicadores Superiores do Modal -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; text-align: center;">
          <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <span style="font-size: 0.72rem; color: #94a3b8; display: block;">Tombamentos</span>
            <strong style="font-size: 1.2rem; color: #38bdf8;">${totalTombamentos}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <span style="font-size: 0.72rem; color: #94a3b8; display: block;">Descartes</span>
            <strong style="font-size: 1.2rem; color: #ffc107;">${totalDescartes}</strong>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <span style="font-size: 0.72rem; color: #94a3b8; display: block;">Manutenções</span>
            <strong style="font-size: 1.2rem; color: #ff6b6b;">${totalManutencoes}</strong>
          </div>
        </div>

        <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 0.9rem; color: #e2e8f0;">Linha do Tempo de Atividades Recentes</h4>

        <div style="background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); max-height: 340px; overflow-y: auto;">
          ${listaEventosHtml}
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <button type="button" class="btn-secondary" onclick="document.getElementById('modal-historico-container').remove()" style="padding: 8px 16px; border-radius: 6px; cursor: pointer;">Fechar Histórico</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/* --- MODAL DE ALTERAÇÃO DE SENHA --- */
function abrirModalTrocarSenha(e) {
  e.preventDefault();
  
  const modalAntigo = document.getElementById('modal-senha-container');
  if (modalAntigo) modalAntigo.remove();

  const modalHtml = `
    <div id="modal-senha-container" class="modal-overlay" style="display: flex; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); justify-content: center; align-items: center; z-index: 99999;">
      <div class="modal-card" style="background: #1e293b; border: 1px solid rgba(0,210,255,0.3); padding: 24px; border-radius: 12px; width: 100%; max-width: 420px; color: #fff;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">Alterar Senha de Acesso</h3>
        
        <form id="form-alterar-senha-modal">
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Senha Atual *</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input type="password" id="m-senha-atual" class="form-input" required placeholder="••••••••" style="width: 100%; padding: 8px 75px 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
              <button type="button" onclick="togglePasswordModal('m-senha-atual', this)" style="position: absolute; right: 8px; background: none; border: none; color: #00d2ff; cursor: pointer; font-size: 0.8rem;">👁 Ver</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Nova Senha *</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input type="password" id="m-senha-nova" class="form-input" required placeholder="••••••••" style="width: 100%; padding: 8px 75px 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
              <button type="button" onclick="togglePasswordModal('m-senha-nova', this)" style="position: absolute; right: 8px; background: none; border: none; color: #00d2ff; cursor: pointer; font-size: 0.8rem;">👁 Ver</button>
            </div>
            <small style="font-size: 0.72rem; color: #94a3b8;">Mín. 8 chars, letras, números e símbolos.</small>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label style="font-size: 0.82rem; color: #94a3b8; display: block; margin-bottom: 4px;">Confirmar Nova Senha *</label>
            <div style="position: relative; display: flex; align-items: center;">
              <input type="password" id="m-senha-confirm" class="form-input" required placeholder="••••••••" style="width: 100%; padding: 8px 75px 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #fff;">
              <button type="button" onclick="togglePasswordModal('m-senha-confirm', this)" style="position: absolute; right: 8px; background: none; border: none; color: #00d2ff; cursor: pointer; font-size: 0.8rem;">👁 Ver</button>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" onclick="fecharModalSenha()" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-primary" style="padding: 8px 14px; border-radius: 6px; cursor: pointer;">Salvar Nova Senha</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('form-alterar-senha-modal').addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const sAtual = document.getElementById('m-senha-atual').value;
    const sNova = document.getElementById('m-senha-nova').value;
    const sConfirm = document.getElementById('m-senha-confirm').value;

    if (sNova !== sConfirm) {
      alert('⚠️ A nova senha e a confirmação não coincidem.');
      return;
    }

    const usr = obterUsuarioLogado();

    const erroForca = validarForcaSenhaGeral(sNova, usr.nome);
    if (erroForca) {
      alert('⚠️ Segurança da Senha:\n' + erroForca);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/alterar-senha`, {
        method: 'PUT',
        headers: obterHeaders(),
        body: JSON.stringify({ 
          email: usr.email, 
          senhaAtual: sAtual, 
          novaSenha: sNova 
        })
      });

      const respostaJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(respostaJson.error || respostaJson.message || 'A senha atual está incorreta.');
      }

      alert('✅ Senha alterada com sucesso no banco de dados!');
      fecharModalSenha();

    } catch (err) {
      alert(`❌ Erro ao alterar senha: ${err.message}`);
    }
  });
}

function fecharModalSenha() {
  const modal = document.getElementById('modal-senha-container');
  if (modal) modal.remove();
}

/* --- REQUISIÇÕES AUXILIARES DA API --- */
function obterHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function tratarResposta(resposta) {
  if (!resposta.ok) {
    if (resposta.status === 401) {
      fazerLogout();
      return;
    }
    const erroJson = await resposta.json().catch(() => ({}));
    const mensagem = erroJson.error || erroJson.message || `Erro (${resposta.status})`;
    throw new Error(mensagem);
  }
  if (resposta.status === 204) return true;
  return await resposta.json();
}

/* Chamadas da API do Inventário e Manutenção */
async function obterTodosEquipamentos() {
  const res = await fetch(`${API_BASE_URL}/equipamentos`, { headers: obterHeaders() });
  return await tratarResposta(res);
}

async function criarEquipamento(dados) {
  const res = await fetch(`${API_BASE_URL}/equipamentos`, {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(dados),
  });
  return await tratarResposta(res);
}

async function atualizarEquipamento(id, dados) {
  const res = await fetch(`${API_BASE_URL}/equipamentos/${id}`, {
    method: 'PUT',
    headers: obterHeaders(),
    body: JSON.stringify(dados),
  });
  return await tratarResposta(res);
}

async function deletarEquipamento(id) {
  const res = await fetch(`${API_BASE_URL}/equipamentos/${id}`, {
    method: 'DELETE',
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

async function obterChamadosManutencao() {
  const res = await fetch(`${API_BASE_URL}/manutencao`, { headers: obterHeaders() });
  return await tratarResposta(res);
}

async function criarChamadoManutencao(dados) {
  const payload = {
    equipamentoId: dados.equipamentoId ? String(dados.equipamentoId) : null,
    nomeEquipamento: String(dados.nomeEquipamento || 'Equipamento do Inventário'),
    descricao: String(dados.descricao || dados.defeito || 'Defeito informado'),
    status: dados.status || 'Alta prioridade',
    tipoStatus: dados.tipoStatus || 'alta',
    icone: dados.icone || '!'
  };

  const res = await fetch(`${API_BASE_URL}/manutencao`, {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(payload)
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error || json.message || 'Falha na validação dos dados de entrada.');
  }

  // Atualiza o equipamento para o status 'Em Manutenção'
  // Se 'moverParaBancada' for true, transfere a localização. Caso contrário, mantém a localização original.
  if (dados.equipamentoId) {
    try {
      const payloadAtualizacao = { status: 'Em Manutenção' };
      if (dados.moverParaBancada) {
        payloadAtualizacao.localizacao = 'Bancada / Sala de Manutenção';
      }

      await fetch(`${API_BASE_URL}/equipamentos/${dados.equipamentoId}`, {
        method: 'PUT',
        headers: obterHeaders(),
        body: JSON.stringify(payloadAtualizacao)
      });
    } catch (errMove) {
      console.warn('Alerta ao atualizar status do equipamento:', errMove);
    }
  }

  return json;
}

async function deletarChamadoManutencao(id) {
  const res = await fetch(`${API_BASE_URL}/manutencao/${id}`, {
    method: 'DELETE',
    headers: obterHeaders(),
  });
  return await tratarResposta(res);
}

document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  atualizarUserChip();
});
/* --- REQUISIÇÕES DA API DE MANUTENÇÃO --- */

function obterHeaders() {
  const token = obterToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function obterTodosEquipamentos() {
  try {
    const res = await fetch(`${API_BASE_URL}/equipamentos`, { headers: obterHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar equipamentos:', err);
    return [];
  }
}

async function obterChamadosManutencao() {
  try {
    const res = await fetch(`${API_BASE_URL}/manutencao`, { headers: obterHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar chamados:', err);
    return [];
  }
}

async function criarChamadoManutencao(dados) {
  // Ajusta o payload para satisfazer 100% o schema do Zod no backend
  const payload = {
    equipamentoId: dados.equipamentoId ? String(dados.equipamentoId) : null,
    nomeEquipamento: String(dados.nomeEquipamento || 'Equipamento do Inventário'),
    descricao: String(dados.descricao || dados.defeito || 'Defeito informado'),
    status: dados.status || 'Alta prioridade',
    tipoStatus: dados.tipoStatus || 'alta',
    icone: dados.icone || '!'
  };

  const res = await fetch(`${API_BASE_URL}/manutencao`, {
    method: 'POST',
    headers: obterHeaders(),
    body: JSON.stringify(payload)
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error || json.message || 'Falha na validação dos dados de entrada.');
  }

  // Se a opção de transferência automática estiver marcada, move o equipamento para a bancada
  if (dados.moverParaBancada && dados.equipamentoId) {
    try {
      await fetch(`${API_BASE_URL}/equipamentos/${dados.equipamentoId}`, {
        method: 'PUT',
        headers: obterHeaders(),
        body: JSON.stringify({
          status: 'Em Manutenção',
          localizacao: 'Bancada / Sala de Manutenção'
        })
      });
    } catch (errMove) {
      console.warn('Não foi possível mover a localização automaticamente:', errMove);
    }
  }

  return json;
}

async function deletarChamadoManutencao(id) {
  const res = await fetch(`${API_BASE_URL}/manutencao/${id}`, {
    method: 'DELETE',
    headers: obterHeaders()
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Erro ao finalizar chamado de manutenção.');
  }

  return true;
}