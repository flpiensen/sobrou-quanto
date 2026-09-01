# 📄 Product Requirements Document (PRD) - SobrouQuanto?

## 1. Visão Geral e Objetivo
O *SobrouQuanto?* é uma aplicação web didática voltada ao gerenciamento de finanças pessoais em nível de cliente. O objetivo principal da aplicação é permitir que os usuários façam login no sistema, cadastrem categorias de gastos/receitas, registrem movimentações financeiras do dia a dia (com opção de anexar comprovantes), acompanhem o saldo restante em tempo real através de gráficos e visualizem as cotações atualizadas das principais moedas estrangeiras.

## 2. Atores do Sistema
- *Visitante:* Usuário não autenticado que acessa a página inicial e é direcionado para a tela de autenticação.
- *Cliente:* Usuário autenticado que realiza o gerenciamento de suas categorias, movimentações financeiras e perfil.
- *AwesomeAPI:* API pública externa que fornece a cotação do Dólar, Euro e Libra em tempo real para o Dashboard.
- *JSON Server:* Backend fake local que armazena e persiste os dados de clientes, categorias e transações.

## 3. Histórias de Usuário e Escopo
Abaixo estão as funcionalidades principais do MVP (Minimum Viable Product), organizadas sob a perspectiva do usuário final.

## 🔐 Épico 1: Autenticação e Sessão ( login.html )
- *US01 - Acesso do Cliente:* Como um Visitante, quero inserir meu e-mail e senha no formulário de login para acessar o painel do SobrouQuanto?.
- *Critérios de Aceitação:* O e-mail e a senha são campos obrigatórios; o e-mail deve ter formato válido; deve haver uma opção de "Lembrar-me"; ao entrar, os dados da sessão devem ser gravados no sessionStorage e o cliente direcionado ao Dashboard ( index.html ).
- *US02 - Saudação da Sessão:* Como um Cliente logado, quero visualizar meu nome no topo da página e minha foto de perfil para confirmar que estou na minha conta.

## 📊 Épico 2: Painel Geral e Cotações ( index.html )
- *US03 - Visualização de Saldo:* Como um Cliente logado, quero ver meu Saldo Total, Total de Receitas e Total de Despesas em destaque no painel principal para saber quanto dinheiro sobrou.
- *Critérios de Aceitação:* O saldo deve ser calculado automaticamente (Receitas - Despesas); os cards devem ter destaques visuais (verde para receitas e vermelho para despesas).
- *US04 - Gráfico de Fluxo de Caixa:* Como um Cliente logado, quero visualizar um gráfico comparativo em formato de anel (Doughnut) entre minhas Receitas e Despesas do mês, para entender rapidamente a proporção dos meus gastos.
- *US05 - Cotação de Moedas Hoje:* Como um Cliente, quero consultar a cotação em tempo real do Dólar, do Euro e da Libra no Dashboard para acompanhar o mercado cambial.
- *Critérios de Aceitação:* A cotação deve ser obtida via requisição assíncrona à AwesomeAPI e exibida nos cards correspondentes indicando se houve alta ou baixa.

## 🏷️ Épico 3: Gestão de Categorias ( cadastros.html )
- *US06 - Cadastrar Categoria:* Como um Cliente, quero cadastrar e listar categorias (ex: Alimentação, Moradia, Salário) para organizar minhas movimentações.
- *Critérios de Aceitação:* O nome da categoria, o tipo (Receita/Despesa) e a escolha de um ícone representativo são obrigatórios; o envio é feito via POST para o JSON Server e a lista é atualizada dinamicamente no DOM com botões de edição e exclusão.

## 💰 Épico 4: Movimentações Financeiras ( transacoes.html )
- *US07 - Realizar Lançamento:* Como um Cliente, quero preencher um formulário informando valor, tipo (Receita/Despesa), categoria, data e opcionalmente anexar um comprovante para registrar uma nova movimentação.
- *Critérios de Aceitação:* O formulário deve abrir em um Modal; os campos básicos são obrigatórios; o valor deve passar por formatação monetária automática (R$); deve haver um campo para anexar imagem (JPG/PNG) ou PDF do comprovante; os dados são salvos via POST no JSON Server.
- *US08 - Extrato de Transações:* Como um Cliente, quero visualizar uma lista/tabela com o histórico de todas as minhas movimentações e filtrá-las por texto, data ou tipo.
- *Critérios de Aceitação:* A lista é carregada via GET do JSON Server e a filtragem atualiza a exibição sem recarregar a página. Deve existir uma área visual de simulação para importação de extrato bancário.
- *US09 - Excluir Transação:* Como um Cliente, quero remover um lançamento cadastrado incorretamente.
- *Critérios de Aceitação:* Um Modal de Confirmação de segurança deve ser exibido antes de disparar a requisição DELETE para o JSON Server.

## 👤 Épico 5: Perfil do Usuário ( profile.html )
- *US10 - Visualizar e Editar Perfil:* Como um Cliente, quero acessar uma tela de perfil para visualizar e atualizar meus dados pessoais.
- *Critérios de Aceitação:* A tela deve conter a foto de perfil (avatar editável), Nome Completo, Profissão/Ocupação e uma área de Bio/Descrição.
- *US11 - Preferências da Conta:* Como um Cliente, quero gerenciar configurações básicas da minha experiência de uso.
- *Critérios de Aceitação:* O sistema deve disponibilizar botões do tipo "switch" para ativar/desativar "Receber alertas de vencimento" e "Modo Escuro".
