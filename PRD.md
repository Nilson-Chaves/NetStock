# PRD — Product Requirements Document: NetStock

## 1. Visão Geral do Produto
O **NetStock** é uma solução corporativa para gestão patrimonial, rastreabilidade, controle de ciclo de vida e manutenção preventiva e corretiva de equipamentos de infraestrutura de rede.

## 2. Objetivos Principais
- Garantir 100% de rastreabilidade do parque de hardware de rede.
- Automatizar o ciclo de vida dos ativos desde o Tombamento até o Descarte/E-Waste.
- Oferecer uma API RESTful segura com autenticação via JWT e auditoria.

## 3. Requisitos Funcionais (RF)
- **RF01 (Autenticação)**: Cadastro e autenticação de administradores com senhas emcriptadas via Bcrypt.
- **RF02 (Gestão de Ativos)**: Cadastro de ativos com geração e validação de patrimônio único.
- **RF03 (Ciclo de Vida & Baixa)**: Mudança de status para Obsoleto, Canibalizado ou Reciclado.
- **RF04 (Manutenção)**: Acompanhamento centralizado de chamados e equipamentos em reparo.
- **RF05 (Dashboard Executivo)**: Apresentação de métricas financeiras, quantitativos e criticidade.

## 4. Requisitos Não Funcionais (RNF)
- **RNF01 (Segurança)**: Proteção de endpoints sensíveis por tokens JWT e armazenamento em `.env`.
- **RNF02 (Persistência)**: Utilização de banco de dados relacional PostgreSQL alimentado via Prisma ORM.
- **RNF03 (Disponibilidade)**: Containerização completa via Docker Compose.