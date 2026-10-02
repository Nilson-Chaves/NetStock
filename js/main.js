import { buscarRecurso, deletarRecurso, criarRecurso } from './api.js';
import { renderizarTabelaProdutos } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaBody = document.getElementById('tabela-produtos-body');
  const formCadastro = document.getElementById('form-produto');

  // Função para carregar e exibir os produtos
  async function carregarProdutos() {
    if (!tabelaBody) return;
    try {
      const produtos = await buscarRecurso('produtos');
      renderizarTabelaProdutos(produtos, tabelaBody, aoDeletarProduto);
    } catch (erro) {
      console.error('Falha ao carregar produtos:', erro);
    }
  }

  // Evento de Exclusão
  async function aoDeletarProduto(id) {
    if (confirm(`Deseja realmente excluir o produto ID ${id}?`)) {
      try {
        await deletarRecurso('produtos', id);
        carregarProdutos();
      } catch (erro) {
        alert('Erro ao excluir o produto.');
      }
    }
  }

  // Evento de Submissão do Formulário
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const novoProduto = {
        codigo: document.getElementById('codigo')?.value || `PRD${Date.now()}`,
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        precoVenda: parseFloat(document.getElementById('preco').value)
      };

      try {
        await criarRecurso('produtos', novoProduto);
        formCadastro.reset();
        carregarProdutos();
      } catch (erro) {
        alert('Erro ao cadastrar novo produto.');
      }
    });
  }

  // Inicializa a listagem na página
  carregarProdutos();
});