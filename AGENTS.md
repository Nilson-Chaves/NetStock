# AGENTS.md — Directrizes de Desenvolvimento e Arquitetura do NetStock

## 1. Padrão Arquitetural
O projeto adota a arquitetura MVC (Model-View-Controller) desacoplada:
- **Camada de Apresentação (Front-end)**: HTML5, CSS3, JavaScript ES6 (Fetch API).
- **Camada de Aplicação (Back-end Express)**: Controllers, Middlewares, Routes.
- **Camada de Persistência**: Prisma ORM sobre Banco de Dados Relacional PostgreSQL.

## 2. Convenções de Código
- **Commits**: Seguir o padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Nomenclatura**: CamelCase em JavaScript e variáveis; snake_case em tabelas do PostgreSQL.
- **Validação de Entrada**: Sempre utilizar schemas Zod na entrada dos controllers.
- **Tratamento de Erros**: Qualquer exceção deve repassar ao middleware `errorHandler`.