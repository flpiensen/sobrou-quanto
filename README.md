# 💰 Sistema de Gestão - SobrouQuanto?

Este projeto tem como objetivo implementar uma aplicação web responsiva para o controle e acompanhamento de finanças pessoais. O sistema permite o cadastro de receitas e despesas, exibição do saldo acumulado em tempo real e busca automática do endereço de estabelecimentos via CEP. O frontend consome uma API local (JSON Server) para persistência das movimentações e APIs públicas para cotação de moedas e autopreenchimento de endereço.

*Autor:* Felipe Santos Iensen

---

## 📚 Documentação do Projeto

Para entender as regras de negócio, o escopo e a arquitetura técnica da aplicação, consulte os documentos abaixo:

- [Product Requirements Document (PRD)](./docs/prd.md) - Visão geral, atores e histórias de usuário.
- [Software Design Document (SDD / Architecture)](./docs/architecture.md) - Diagrama de banco de dados (DER), contratos das APIs e fluxo de dados.

---

## 🎨 Design

- [Design System](./docs/sdd.md) - Identidade visual, tipografia e paleta de cores (Design Tokens).
- [Protótipo no Stitch](https://stitch.withgoogle.com/) - Telas e componentes interativos gerados para a aplicação.

---

## 🌐 Site em Produção - GitHub Pages

- [Link do Projeto publicado no GitHub Pages](https://flpiensen.github.io/sobrou-quanto/)

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado na máquina.
- Extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/flpiensen/sobrou-quanto.git](https://github.com/flpiensen/sobrou-quanto.git)
   cd sobrou-quanto


## 📊 Checklist de Indicadores de Desempenho (IDs)

> **Nota:** Marque com `[x]` apenas os itens que foram efetivamente implementados na aplicação e que você domina para explicação na defesa técnica.

### RA1 - Utilizar Frameworks CSS para estilização de elementos HTML e criação de layouts responsivos
- [ ] **ID01:** Prototipa interfaces adaptáveis para no mínimo os tamanhos de tela mobile e desktop, usando ferramentas de IA (Stitch) e/ou design (Figma).
- [ ] **ID02:** Implementa layout responsivo com Framework CSS (Bootstrap) usando Flexbox ou Grid do próprio framework.
- [ ] **ID03:** Implementa layout responsivo com CSS puro, usando Flexbox ou Grid Layout.
- [ ] **ID04:** Utiliza componentes prontos de um Framework CSS (ex.: card, button) e componentes JavaScript do framework (ex.: modal, navbar).
- [ ] **ID05:** Cria layout fluido usando unidades relativas (`vw`, `vh`, `%`, `em`, `rem`) no lugar de unidades fixas (`px`).
- [ ] **ID06:** Aplica um Design System consistente (cores, tipografia, padrões de componentes) em toda a aplicação.
- [ ] **ID07:** Utiliza Sass (SCSS) com ou sem framework, aplicando variáveis, mixins e funções para modularizar o código.
- [ ] **ID08:** Aplica tipografia responsiva (media queries mobile first) ou tipografia fluida (`clamp()` + unidades relativas).
- [ ] **ID09:** Aplica técnicas de responsividade de imagens usando CSS (`object-fit`, containers com unidades relativas).
- [ ] **ID10:** Otimiza imagens usando formatos modernos (WebP) e carregamento adaptativo (`srcset`, `picture`).

### RA2 - Realizar tratamento de formulários e aplicar validações customizadas no lado cliente
- [ ] **ID11:** Implementa validação HTML nativa (campos obrigatórios, tipos, limites de caracteres) com mensagens de erro/sucesso no lado cliente.
- [ ] **ID12:** Aplica expressões regulares (REGEX) para validações customizadas (moeda, e-mail).
- [ ] **ID13:** Utiliza elementos de seleção em formulários (`checkbox`, `radio`, `select`) para coleta de dados.
- [ ] **ID14:** Implementa leitura e escrita no Web Storage (`localStorage`/`sessionStorage`) para persistir dados localmente no cliente.

### RA3 - Aplicar ferramentas para otimização do processo de desenvolvimento web
- [ ] **ID15:** Configura ambiente com Node.js e NPM para gerenciamento de pacotes e dependências.
- [ ] **ID16:** Utiliza boas práticas de versionamento no Git / GitHub (branch `main`, uso de `.gitignore`).
- [ ] **ID17:** Mantém um `README.md` padronizado, conforme template da disciplina, com checklist preenchido.
- [ ] **ID18:** Organiza arquivos do projeto de forma modular, seguindo padrão de exemplo fornecido (`/docs`, `/assets`, `/server`).
- [ ] **ID19:** Configura linters e formatadores (ESLint, Prettier) para manter qualidade e padronização do código.

### RA4 - Aplicar bibliotecas de funções e componentes em JavaScript para aprimorar a interatividade
- [ ] **ID20:** Utiliza jQuery para manipulação do DOM e interatividade (eventos, animações).
- [ ] **ID21:** Integra e configura um plugin jQuery relevante (ex.: jQuery Mask Plugin) ou outra biblioteca de funções.

### RA5 - Efetuar requisições assíncronas para uma API fake e APIs públicas
- [ ] **ID22:** Realiza requisições assíncronas para uma API fake (JSON Server) para persistir dados de um formulário (`POST`).
- [ ] **ID23:** Realiza requisições assíncronas para uma API fake para exibir e remover dados na página (`GET`, `DELETE`).
- [ ] **ID24:** Realiza requisições assíncronas para APIs públicas reais (AwesomeAPI para moedas), exibindo os dados e tratando erros com `fetch` e `async/await`.