# 📄 Product Requirements Document (PRD) - SobrouQuanto?

## 1. Visão Geral e Objetivo
O **SobrouQuanto?** é uma aplicação web didática voltada ao gerenciamento de finanças pessoais em nível de cliente. O objetivo principal da aplicação é permitir que os usuários façam login no sistema, cadastrem categorias de gastos/receitas, registrem movimentações financeiras do dia a dia, acompanhem o saldo restante em tempo real e visualizem as cotações atualizadas das principais moedas estrangeiras.

## 2. Atores do Sistema
- **Visitante:** Usuário não autenticado que acessa a página inicial e é direcionado para a tela de autenticação.
- **Cliente:** Usuário autenticado que realiza o gerenciamento de suas categorias e movimentações financeiras.
- **AwesomeAPI:** API pública externa que fornece a cotação do Dólar e do Euro em tempo real para o Dashboard.
- **JSON Server:** Backend fake local que armazena e persiste os dados de categorias e transações do cliente.

## 3. Histórias de Usuário e Escopo

Abaixo estão as funcionalidades principais do MVP (Minimum Viable Product), organizadas sob a perspectiva do usuário final.

### 🔐 Épico 1: Autenticação e Sessão (`login.html`)
- **US01 - Acesso do Cliente:** Como um Visitante, quero inserir meu e-mail e senha no formulário de login para acessar o painel do SobrouQuanto?.
  - *Critérios de Aceitação:* O e-mail e a senha são campos obrigatórios; o e-mail deve ter formato válido; ao entrar, os dados da sessão devem ser gravados no `sessionStorage` e o cliente direcionado ao Dashboard (`index.html`).
- **US02 - Saudação da Sessão:** Como um Cliente logado, quero visualizar meu nome/e-mail no topo da página para confirmar que estou na minha conta.

### 📊 Épico 2: Painel Geral e Cotações (`index.html`)
- **US03 - Visualização de Saldo:** Como um Cliente logado, quero ver meu Saldo Total, Total de Receitas e Total de Despesas em destaque no painel principal para saber quanto dinheiro sobrou.
  - *Critérios de Aceitação:* O saldo deve ser calculado automaticamente (Receitas - Despesas); os cards devem ter destaques visuais (verde para receitas e vermelho para despesas).
- **US04 - Cotação de Moedas Hoje:** Como um Cliente, quero consultar a cotação em tempo real do Dólar e do Euro no Dashboard para acompanhar o mercado cambial.
  - *Critérios de Aceitação:* A cotação deve ser obtida via requisição assíncrona à AwesomeAPI e exibida nos cards correspondentes.

### 🏷️ Épico 3: Gestão de Categorias (`cadastros.html`)
- **US05 - Cadastrar Categoria:** Como um Cliente, quero cadastrar e listar categorias (ex: Alimentação, Moradia, Salário) para organizar minhas movimentações.
  - *Critérios de Aceitação:* O nome da categoria é obrigatório; o envio é feito via `POST` para o JSON Server e a lista é atualizada dinamicamente no DOM.

### 💰 Épico 4: Movimentações Financeiras (`transacoes.html`)
- **US06 - Realizar Lançamento:** Como um Cliente, quero preencher um formulário informando valor, tipo (Receita/Despesa), categoria e data para registrar uma nova movimentação.
  - *Critérios de Aceitação:* Todos os campos são obrigatórios; o valor deve passar por validação de formato monetário (REGEX); os dados são salvos via `POST` no JSON Server.
- **US07 - Extrato de Transações:** Como um Cliente, quero visualizar uma lista/tabela com o histórico de todas as minhas movimentações e filtrá-las por tipo.
  - *Critérios de Aceitação:* A lista é carregada via `GET` do JSON Server e a filtragem por tipo atualiza a exibição sem recarregar a página.
- **US08 - Excluir Transação:** Como um Cliente, quero remover um lançamento cadastrado incorretamente.
  - *Critérios de Aceitação:* Um Modal de Confirmação deve ser exibido antes de disparar a requisição `DELETE` para o JSON Server.