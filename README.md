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
- [Protótipo no Stitch](https://stitch.withgoogle.com/projects/12731310984783563195) - Telas e componentes interativos gerados para a aplicação.
- [Protótipo exportado (backup navegável)](./designs/) - Telas (HTML + screenshots) exportadas do Stitch, versionadas no repositório para o caso do link do Stitch exigir login.

---

## 🛠️ Tecnologias e Dependências

### **Framework CSS**
* **[Bootstrap 5.3](https://getbootstrap.com/)**
  * **Justificativa:** Framework CSS mais adotado do mercado, com documentação extensa, grande comunidade e projeto ativo no GitHub (licença MIT). Seu sistema de grid em Flexbox resolve com facilidade a responsividade mobile/desktop do protótipo, e os componentes prontos (Navbar, Cards, Modais, Forms) cobrem os elementos identificados no protótipo do Stitch. A partir da v5 não depende mais de jQuery.
* **[Bootstrap Icons](https://icons.getbootstrap.com/)**
  * **Justificativa:** Biblioteca de ícones oficial do Bootstrap, com integração nativa — usada nos ícones de categoria (`bi-basket`, `bi-cash-coin`, etc.) e da interface como um todo.
* **[Vite](https://vite.dev/)** — dependência de desenvolvimento
  * **Justificativa:** Servidor de desenvolvimento e build do site com várias páginas (MPA), no mesmo padrão do repositório modelo da disciplina ([lab-framework-css](https://github.com/utfpr-gp/lab-framework-css)). Compila o Sass de cada página, resolve as dependências do `node_modules` e gera a pasta `dist/` publicada no GitHub Pages.
* **[Sass (SCSS)](https://sass-lang.com/)** — dependência de desenvolvimento
  * **Justificativa:** Pré-processador CSS usado para centralizar os Design Tokens do `docs/sdd.md` em variáveis, reaproveitar estilos com mixins e personalizar o Bootstrap (cores, fontes e bordas) antes da compilação. O CSS global fica em `src/scss/main.scss` (tokens, mixins, Bootstrap personalizado e componentes comuns) e cada página tem o seu próprio `.scss` na pasta dela, que começa com `@use '../../scss/main';`. O Sass é compilado pelo Vite.

### **API Pública**
* **[AwesomeAPI (Cotações de Moedas)](https://docs.awesomeapi.com.br/api-de-moedas)**
  * **Justificativa:** Utilizada para buscar cotações de moedas em tempo real (como USD, EUR e BTC para BRL). A API agrega valor ao sistema permitindo converter valores de receitas e despesas ou exibir o saldo da conta atualizado de acordo com a variação cambial do dia, enriquecendo a gestão financeira pessoal com dados reais do mercado.

---

## 🌐 Site em Produção - GitHub Pages

- [Link do Projeto publicado no GitHub Pages](https://flpiensen.github.io/sobrou-quanto/)

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado na máquina.

### Passo a Passo

1. **Clonar o repositório e instalar as dependências** (Bootstrap, ícones, fontes, Vite, Sass e JSON Server):
   ```bash
   git clone https://github.com/flpiensen/sobrou-quanto.git
   cd sobrou-quanto
   npm install
   ```

2. **Subir a API fake (JSON Server)** — deixe este terminal aberto:
   ```bash
   npm run api
   ```
   Os dados ficam no arquivo `server/db.json`, que começa vazio.

3. **Subir o site (Vite)** — em outro terminal:
   ```bash
   npm run dev
   ```
   O navegador abre em `http://localhost:5173`. Sem sessão, a aplicação leva para o login (`src/paginas/login/index.html`).

4. **Criar a conta** em "Cadastre-se gratuitamente", depois cadastrar as **categorias** e registrar as **movimentações**. O dashboard, os limites e as notificações são calculados a partir desses cadastros.

5. **Gerar a versão de produção:** `npm run build` cria a pasta `dist/` (e `npm run preview` abre essa versão). No GitHub, o workflow `.github/workflows/deploy.yml` faz o build e publica no GitHub Pages a cada push na `main`.

> Os scripts são ES Modules e os estilos são `.scss`: abrir o HTML com duplo clique (`file://`) não funciona; use sempre o `npm run dev` (passo 3).

### Estrutura de pastas

Segue o padrão do repositório modelo da disciplina ([lab-framework-css](https://github.com/utfpr-gp/lab-framework-css)): cada página fica na sua própria pasta, com o seu HTML, o seu CSS e o seu JS, e o que é comum a todas fica no CSS e no JS globais.

```
index.html                    Dashboard (página inicial)
vite.config.js                MPA: cada página é registrada aqui
server/db.json                banco da API fake (JSON Server)
docs/                         prd.md, architecture.md, sdd.md
src/
  scss/
    main.scss                 CSS GLOBAL: Bootstrap personalizado + tema
    _variables.scss           Design Tokens
    _mixins.scss              mixins reutilizáveis
    _bootstrap.scss           variáveis do Bootstrap + import
    _base.scss, _layout.scss, _componentes.scss, _estados.scss
  js/
    main.js                   sessão, navbar, notificações (comum a todas)
    rotas.js                  endereço de cada página
    api.js, calculos.js, render.js, validacao.js, notificacoes.js, comprovante.js
  paginas/
    dashboard/                dashboard.scss + dashboard.js (HTML = index.html da raiz)
    login/                    index.html + login.scss + login.js
    transacoes/               index.html + transacoes.scss + transacoes.js
    categorias/               index.html + categorias.scss + categorias.js
    perfil/                   index.html + perfil.scss + perfil.js
```

## 📊 Checklist de Indicadores de Desempenho (IDs)

> **Nota:** Marque com `[x]` apenas os itens que foram efetivamente implementados na aplicação e que você domina para explicação na defesa técnica.

### RA1 - Utilizar Frameworks CSS para estilização de elementos HTML e criação de layouts responsivos
- [x] **ID01:** Prototipa interfaces adaptáveis para no mínimo os tamanhos de tela mobile e desktop, usando ferramentas de IA (Stitch) e/ou design (Figma).
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
- [x] **ID15:** Configura ambiente com Node.js e NPM para gerenciamento de pacotes e dependências.
- [ ] **ID16:** Utiliza boas práticas de versionamento no Git / GitHub (branch `main`, uso de `.gitignore`).
- [x] **ID17:** Mantém um `README.md` padronizado, conforme template da disciplina, com checklist preenchido.
- [x] **ID18:** Organiza arquivos do projeto de forma modular, seguindo padrão de exemplo fornecido (`/docs`, `/src/scss` global, `/src/js` compartilhado e `/src/paginas/<pagina>` com HTML, SCSS e JS de cada tela, no padrão do `lab-framework-css`).
- [ ] **ID19:** Configura linters e formatadores (ESLint, Prettier) para manter qualidade e padronização do código.

### RA4 - Aplicar bibliotecas de funções e componentes em JavaScript para aprimorar a interatividade
- [ ] **ID20:** Utiliza jQuery para manipulação do DOM e interatividade (eventos, animações).
- [ ] **ID21:** Integra e configura um plugin jQuery relevante (ex.: jQuery Mask Plugin) ou outra biblioteca de funções.

### RA5 - Efetuar requisições assíncronas para uma API fake e APIs públicas
- [ ] **ID22:** Realiza requisições assíncronas para uma API fake (JSON Server) para persistir dados de um formulário (`POST`).
- [ ] **ID23:** Realiza requisições assíncronas para uma API fake para exibir e remover dados na página (`GET`, `DELETE`).
- [ ] **ID24:** Realiza requisições assíncronas para APIs públicas reais (AwesomeAPI para moedas), exibindo os dados e tratando erros com `fetch` e `async/await`.
