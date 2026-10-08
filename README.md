# NetStock — Inventário de Rede & Controle de Ativos de TI

> Sistema web leve e dinâmico para cadastro, monitoramento e gerenciamento centralizado de equipamentos e ativos de infraestrutura de rede.

## Ideia, Objetivo Principal & Público-Alvo
- **Ideia & Objetivo:** Desenvolver uma plataforma web acessível via rede local para controle de inventário de TI, permitindo registrar, consultar e gerenciar equipamentos (switches, roteadores, servidores) e seu status de manutenção com persistência de dados em tempo real.
- **Público-Alvo:** Administradores de rede, equipes de suporte técnico/TI, gerentes de infraestrutura e operadores de data center.
- **Problema:** A gestão manual de ativos via planilhas descentralizadas ou comandos diretos de terminal (CLI) gera falta de visibilidade sobre o inventário de rede, perda de histórico de alterações e inconsistência de dados entre dispositivos.
- **Solução & Valor:** O NetStock centraliza os dados em uma interface web intuitiva e responsiva, permitindo acesso multi-dispositivo na mesma rede local (desktop e mobile), automação da API REST via `json-server` e atualização instantânea do estado dos equipamentos.

## Benchmarking (Análise Comparativa)
| Ferramenta | Pontos Fortes | Limitações | Diferencial da Solução |
| ---------- | ------------- | ---------- | ---------------------- |
| Snipe-IT | Extremamente completo e robusto | Configuração complexa e pesado para redes pequenas | Setup ultraleve e execução rápida com Node.js |
| NetBox | Foco em documentação de rede/DCIM | Curva de aprendizado elevada | Interface simples, responsiva e focada na agilidade operacional |
| Excel / Sheets | Fácil acesso inicial | Sem concorrência real, propenso a erros e sem API REST | Persistência JSON estruturada e consulta dinamicamente resolvida por hostname |

## Equipe
- **Nilson Vinícius Aurelio Chaves** - Matrícula: 20221380002 | [GitHub](https://github.com/Nilson-Chaves)
- **Wellington Antonio da Silva** - Matrícula: 20221380031 | [GitHub](https://github.com/Nilson-Chaves)

## Documentação & Recursos
- **Repositório do Projeto:** [NetStock no GitHub](https://github.com/Nilson-Chaves/NetStock)
- **Documentação de Requisições:** [Ver arquivo requisicoes.http](requisicoes.http)
- **Base de Dados (JSON):** [Ver arquivo db.json](db.json)

## Páginas / Telas da Aplicação
- 🏠 **Índice / Home:** `index.html`
- 📊 **Dashboard:** `dashboard.html`
- 📦 **Inventário de Ativos:** `inventario.html`
- ⚙️ **Gerenciamento de Equipamentos:** `equipamento.html`
- 🛠️ **Manutenção & Histórico:** `manutencao.html`

## Funcionalidades Implementadas & Planejadas (Features)
- [x] Interface Web responsiva para visualização e navegação no inventário de rede
- [x] Servidor web estático (`http-server`) e API REST simulada (`json-server`) executados concorrentemente (`concurrently`)
- [x] Vinculação de host local (`0.0.0.0`) nas portas `5500` (Web) e `3000` (API) para acesso multi-dispositivo na LAN
- [x] Resolução dinâmica da URL da API no frontend via `window.location.hostname`
- [x] Cadastro e atualização de equipamentos em tempo real com persistência no `db.json`
- [ ] Filtro e busca dinâmica por código/ID, tipo de equipamento ou status
- [ ] Módulo avançado de registro e ordens de serviço de manutenção
- [ ] Autenticação e controle de acesso para operadores e administradores de TI

## Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js**: v18.x ou superior
- **npm**: v8.x ou superior

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/Nilson-Chaves/NetStock.git](https://github.com/Nilson-Chaves/NetStock.git)
   cd NetStock
